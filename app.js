var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose'),
  Bluebird = require('bluebird'),
  api = require('instagram-node').instagram();

  Bluebird.promisifyAll(api);

mongoose.connect(config.db);
var db = mongoose.connection;
console.log('db info: ', db);
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});
var User = require('./app/models/user');

var app = express();

api.use({
  client_id: '525b8ba13e104566b27a01518e8e20de',
  client_secret: 'a139bb38101143319abe579ce2af5844'
});

var redirect_uri = 'http://localhost:3000/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect( api.get_authorization_url( redirect_uri, { scope: ['likes','basic','relationships', 'public_content','follower_list'] } ) );
};

exports.handleauth = function(req, res) {

  api.authorize_userAsync(req.query.code, redirect_uri)
   .then(function (result) {
    res.cookie('instaToken',result.access_token, { maxAge: 900000, httpOnly: true });
    res.cookie('userId',result.user.id, { maxAge: 900000, httpOnly: true });
    User.count({iUserId: result.user.id}, function (err, count){ 
        if(count === 0){
          // create a new user
          var newUser = User({
            iName: result.user.username,
            iDisplayName: result.user.full_name,
            iUserId: result.user.id,
            admin: false
          });

          // save the user
          newUser.save(function(err) {
            if (err) throw err;
            console.log('User created!');
          });
        }
    }); 
     res.redirect('/dashboard');
   })
   .catch(function (errors) {
     console.log(errors);
   });
};

app.get( '/authorize_user', exports.authorize_user );
app.get( '/handleauth', exports.handleauth );

module.exports = require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

