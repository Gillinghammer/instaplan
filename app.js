var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose'),
  api = require('instagram-node').instagram();

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var app = express();


api.use({
  client_id: 'f354d0ea817643559a11a06a7c905264',
  client_secret: 'cee7bf9981bc438d8b0a8dc168a1cbae'
});

var redirect_uri = 'http://localhost:3000/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect( api.get_authorization_url( redirect_uri, { scope: ['likes','basic','relationships'] } ) );
};

exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result){
    if (err) {
      console.log(err.body);
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};

app.get('/authorize_user', exports.authorize_user);
app.get('/handleauth', exports.handleauth);

module.exports = require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

