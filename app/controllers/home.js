var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  Bluebird      = require('bluebird'),
  instaApi = require('instagram-node').instagram();

  Bluebird.promisifyAll(instaApi);

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('index', {
      title: 'InstaPlan',
      articles: articles
    });
  });
});

router.get('/dashboard', function (req, res, next) {

  // setting user variables
  var imageUrl = "",
      followerCount = 0,
      followingCount = 0,
      userName = '',
      profileImageUrl = '',
      profileDescription = '';
  
  // get user details
  var getUser = function() {
    return new Promise(function(resolve,reject) {
      console.log('getting user details now...')

      return instaApi.userAsync(req.cookies.userId)
      .then(function (result, remaining, limit) {
        console.log(result)
        userName = result.username
        followingCount = result.counts.follows
        followerCount = result.counts.followed_by
        profileImageUrl = result.profile_picture
        profileDescription = result.bio
        website = result.website
        resolve(result)
      })
      .catch(function (errors) {
        console.log(errors);
      })
    })
  }

  // get recent images
  var getRecentMedia = function(result) {
    return new Promise(function(resolve,reject) {
      return instaApi.user_self_media_recentAsync()
      .spread(function(medias,pagination,remaining,limit){
        console.log("your export", medias.images.standard_resolution.url)
        imageUrl = medias.images.standard_resolution.url
        // return instaApi.mediaAsync(medias[Math.floor(Math.random() * medias.length -1) + 1].id);
        return "foobar"
      })
      .then(function(image){
        resolve(result)
      })
    })
  }

  // render page
  var renderPage = function(result) {
    res.render('dashboard', {
      image_url: imageUrl,
      follower_count: followerCount,
      following_count: followingCount,
      user_name: userName,
      profile_image_url: profileImageUrl,
      profile_description: profileDescription,
      website: website
    });
  }
  
  if (req.cookies.instaToken) {
      instaApi.use({ access_token: req.cookies.instaToken });
      
      getUser()
      .then(function(result) {
        return getRecentMedia(result)
      })
      .then(function(result) {
        return renderPage(result)
      })
      .catch(function(errors){
        console.log(erros);
      });
      
    } else {
      res.render('index', {
        showLogin: true
      });
    }

});
