// grab the things we need
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// create a schema
var UserSchema = new Schema({
  iName: { type: String, required: true},
  iDisplayName: { type: String, required: true},
  iUserId: { type: String, required: true, unique: true },
  admin: Boolean,
  meta: {
    iFollows: Number,
    iFollowedBy: Number,
    iMediaCount: Number,
    homeBase: String,
    currentLocation: String,
    website: String,
    iPicture: String,
    iBio: String
  },
  created_at: Date,
  updated_at: Date
});

// on every save, add the date
UserSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;