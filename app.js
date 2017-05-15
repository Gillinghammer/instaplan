var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose'),
  Bluebird = require('bluebird'),
  numeral = require('numeral'),
  session = require('client-sessions');

var api = require('instagram-node').instagram();
var middlewares = require("./app/middlewares");
var handlers = require("./app/handlers");

// wrap instagram api in promise library
Bluebird.promisifyAll(api);

// connect to the db
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

// require user model
var User = require('./app/models/user');

// setup app with express
var app = express();


// initialize session configuration
app.use(session({
  cookieName: 'session',
  secret: '883jeis93kk93dk92jhs110001jdj',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use(middlewares.setLocals);
app.use(middlewares.redirectLocals);

// url for instagram to redirect back to upon successful authentication
var redirect_uri = 'http://127.0.0.1:3000/handleauth';

// function to run for instagrams authentication
exports.authorize_user = function(req, res) {
  api.use({
    client_id: '525b8ba13e104566b27a01518e8e20de',
    client_secret: 'a139bb38101143319abe579ce2af5844'
  });
  res.redirect( api.get_authorization_url( redirect_uri, { scope: ['likes','basic','relationships', 'public_content','follower_list'] } ) );
};

// function to run upon successful authentication
exports.handleauth = function(req, res) {
  api.authorize_userAsync(req.query.code, redirect_uri)
  .then(function (result) {
    req.session.access_token = result.access_token
    api.use({ access_token: req.session.access_token });
    return api.userAsync(result.user.id)
  })
   .then(function (result) {
    User.findOne({ instagramId: result.id }, function (err, user){ 
      if( !user ){
        // create a new user
        var newUser = User({
          userName: result.username,
          fullName: result.full_name,
          instagramId: result.id,
          email: '',
          admin: false,
          meta: {
            follows: result.counts.follows,
            followedBy: result.counts.followed_by,
            mediaCount: result.counts.media,
            homeBase: '',
            currentLocation: '',
            nextTrip: '',
            website: result.website,
            picture: result.profile_picture,
            bio: result.bio
          }
        });
        // save the user
        req.session.user = newUser;
        newUser.save(function(err) {
          if (err) throw err;
          console.log('NEW USER CREATED:' );
          res.redirect('dashboard');
        });
      } else {
        api.userAsync(user.instagramId).
        then(function(result){
          console.log("ah ha! returning user, score: ", result )
          user.meta.follows = result.counts.follows;
          user.meta.followedBy = result.counts.followed_by;
          user.meta.mediaCount = result.counts.media;
          user.meta.picture = result.profile_picture;
          user.save(function (err, user) {
            if (err) return handleError(err);
            console.log("User Saved ", user )
          });
        }).done(function(result){
          req.session.user = user;
          res.redirect('dashboard');
        })  
      }
    }); 
   })
   .catch(function (errors) {
     console.log(errors);
   });
};

exports.admin = function(req, res) {
  User.find(function (err, users) {
    if (err) return handleError(err);
    res.render('admin', {
      users: users
    });
  });
}

exports.deleteUser = function(req,res) {
  res.send('removed id: ' + req.params.id );
}

exports.updateUser = function(req,res) {
  console.log('form data: ', req.body)
  User.findById(req.body.id, function (err, user) {
    if (err) return handleError(err);
    user.email = req.body.email;
    user.iDisplayName = req.body.displayName;
    user.meta.website = req.body.website;
    user.meta.homeBase = req.body.home;
    user.meta.currentLocation = req.body.current;
    user.meta.nextTrip = req.body.next;
    user.meta.iBio = req.body.bio;
    user.save(function (err, user) {
      if (err) return handleError(err);
      console.log("User Saved ", user )
      res.render( 'dashboard', { user } );
    });
  });
}

exports.home = function(req,res) {
  res.render('index');
}

exports.dashboard = function(req,res) {
  console.log("what is in locals just before we render the dashboard: ", res.locals );
  res.render('dashboard');
  
}

exports.welcome = function(req, res) {
  res.render('welcome');
}

exports.brands = function(req,res) {
  res.render('brands');
}

exports.explore = function(req,res) {
  res.render('explore');
}

app.get( '/authorize_user', exports.authorize_user );
app.get('/', exports.home );
app.get('/explore', exports.explore );
app.get('/brands', exports.brands);
app.get('/dashboard', handlers.requireLogin, handlers.requireEmail, handlers.networkStats, exports.dashboard );
app.get('/welcome', exports.welcome);
app.get( '/handleauth', exports.handleauth );
app.get( '/admin', handlers.checkAdmin, exports.admin );
app.get('/delete/:id', exports.deleteUser );
app.post('/update', exports.updateUser );
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

module.exports = require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

