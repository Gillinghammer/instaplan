var User = require('./models/user');
var numeral = require('numeral');
module.exports = {
  checkAdmin: function(req,res,next){
    if(req.session.user){
      User.findOne({ _id: req.session.user._id }, function (err, user){
        if(user.admin){ next()
         } else {
          res.redirect('/')
         }
      })
    } else {
      res.redirect('/')
    }
  },
  requireEmail: function(req, res, next){
    if(req.session.user.email === ''){
      res.redirect('/welcome');
    } else {
      next();
    }
  },
  requireLogin: function(req,res,next){
    if (!req.session.user) {
      res.redirect('/');
    } else {
      next();
    }
  },
  networkStats: function(req,res,next){
    if(req.session) {
      // summarize total reach of all accounts
      User.aggregate([
        { "$group":{ 
          "_id": null, 
          "reach": { "$sum": "$meta.followedBy"} 
        }}], function(err, result) {
        res.locals.reach = "+" + numeral(result[0].reach).format('0.0a');
      });
      User.aggregate([
        { "$group":{ 
          "_id": null, 
          "combinedMedia": { "$sum": "$meta.mediaCount"} 
        }}], function(err, result) {
        res.locals.mediaCount = numeral(result[0].combinedMedia).format('0,0');
      });
      // return the count of accounts
      User.find().count(function(err,count){
        res.locals.registeredAccounts = count;
        next()
      })
    }
  }
}