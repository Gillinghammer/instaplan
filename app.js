var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose'),
  Bluebird = require('bluebird'),
  api = require('instagram-node').instagram(),
  session = require('client-sessions');

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

// instagram credentials, hide these!
api.use({
  client_id: '525b8ba13e104566b27a01518e8e20de',
  client_secret: 'a139bb38101143319abe579ce2af5844'
});

function requireEmail (req, res, next) {  
  if(req.user.email === ''){
    res.render('welcome');
  } else {
    next();
  }
}

app.use(function(req, res, next) {
  if (req.session && req.session.instagram) {
    User.findOne({ instagramId: req.session.instagram.user.id }, function(err, user) {
      if (user) {
        req.user = user;
        req.session.instagram.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// url for instagram to redirect back to upon successful authentication
var redirect_uri = 'http://localhost:3000/handleauth';

// function to run for instagrams authentication
exports.authorize_user = function(req, res) {
  res.redirect( api.get_authorization_url( redirect_uri, { scope: ['likes','basic','relationships', 'public_content','follower_list'] } ) );
};

// function to run upon successful authentication
exports.handleauth = function(req, res) {
  api.authorize_userAsync(req.query.code, redirect_uri)
   .then(function (result) {
    // set session cookie to instagram result
    req.session.instagram = result;
    console.log('setting session cookie to: ', result)
    User.findOne({ instagramId: req.session.instagram.user.id }, function (err, user){ 
      if( !user ){
        // create a new user
        var newUser = User({
          userName: req.session.instagram.user.username,
          fullName: req.session.instagram.user.full_name,
          instagramId: req.session.instagram.user.id,
          email: '',
          admin: false,
          meta: {
            follows: 0,
            followedBy: 0,
            mediaCount: 0,
            homeBase: '',
            currentLocation: '',
            nextTrip: '',
            website: req.session.instagram.user.website,
            picture: req.session.instagram.user.profile_picture,
            bio: req.session.instagram.user.bio
          }
        });
        // save the user
        newUser.save(function(err) {
          if (err) throw err;
          console.log('NEW USER CREATED:' );
          res.redirect('dashboard');
        });
      } else {
        res.redirect('dashboard');
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
  res.render('dashboard');
}

exports.welcome = function(req, res) {
  res.render('welcome');
}

app.get('/', exports.home );
app.get('/dashboard', requireLogin, requireEmail, exports.dashboard );
app.get('/welcome', exports.welcome);
app.get( '/authorize_user', exports.authorize_user );
app.get( '/handleauth', exports.handleauth );
app.get( '/admin', exports.admin );
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

