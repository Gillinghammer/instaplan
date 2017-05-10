var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Bluebird      = require('bluebird'),
  instaApi = require('instagram-node').instagram();

  Bluebird.promisifyAll(instaApi);

  var User = require('../models/user');

module.exports = function (app) {
  app.use('/', router);
};

router.post('/submit', function (req, res, next) {
  console.log('form data: ', req.body)
  
  // use to confirm form data being submitted
  // res.send(req.body);

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
  
});