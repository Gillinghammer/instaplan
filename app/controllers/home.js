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

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'InstaPlan'
  });
});

router.get('/dashboard', function (req, res, next) {
  
  // get user details
  var getUser = function() {
    return new Promise(function(resolve,reject) {
      console.log('getting user details now...')
      return instaApi.userAsync(req.cookies.userId)
      .then(function (result, remaining, limit) {
        console.log(result)
        var updateData = {
          meta: {
            iFollows: result.counts.follows,
            iFollowedBy: result.counts.followed_by,
            website: result.website,
            iPicture: result.profile_picture,
            iBio: result.bio,
            homeBase: 'Earth',
            currentLocation: 'default location'
          }
        }

        User.findOneAndUpdate({'iUserId':req.cookies.userId}, updateData , {upsert:false}, function(err, user){
            if (err) return res.send(500, { error: err });
            resolve(user)
        });

      })
      .catch(function (errors) {
        console.log(errors);
      })
    })
  }

  // render page
  var renderPage = function(user) {
    res.render('dashboard', { user: user });
  }
  
  if (req.cookies.instaToken) {
      instaApi.use({ access_token: req.cookies.instaToken });
      
      getUser()
      .then(function(user) {
        return renderPage(user)
      })
      .catch(function(errors){
        console.log(erros);
      });
      
    } else {
      res.render('index');
    }

});
