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

module.exports = mongoose.model('user', userSchema);
