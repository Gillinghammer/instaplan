// grab the things we need
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// create a schema
var UserSchema = new Schema({
  userName: { type: String, required: true},
  fullName: { type: String, required: true},
  instagramId: { type: String, required: true, unique: true },
  email: String,
  admin: Boolean,
  meta: {
    follows: Number,
    followedBy: Number,
    mediaCount: Number,
    homeBase: String,
    currentLocation: String,
    nextTrip: String,
    website: String,
    picture: String,
    bio: String
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

// this returns the total reach of all accounts
// db.users.aggregate([{$group:{ _id: null, reach: {$sum: "$meta.followedBy"} }}])


// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;