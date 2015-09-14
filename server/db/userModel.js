/**
* Creates a mongoose model and mongo schema for users
* @module userModel
* @requires mongoose
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: String,
  householdId: String,
  invites: [{type: Schema.Types.ObjectId, unique: true}], // ObjectId Of households
  fullName: String,
  picture: String,
  zip: String
});

/**
* @class userModel
* @constructor
*/
module.exports = mongoose.model('user', userSchema);
