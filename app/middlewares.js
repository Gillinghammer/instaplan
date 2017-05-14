var User = require('./models/user');
module.exports = {
  redirectLocals: function(req, res, next){
    // hack that allows request session to be available in case of redirect
    if(req.session) {
      res.locals = req.session; // should include values for .user and .access_token
      // console.log("middleware setting locals", res.locals )
    }
    next()
  },
  setLocals: function(req,res,next){
    if (req.session && req.session.user) {
      User.findOne({ instagramId: req.session.user.id }, function(err, user) {
        if (user) {
          req.user = user;
          req.session.user = user;  //refresh the session value
          res.locals.user = user;
        }
        next();
      });
    } else {
      next();
    }
  }
}