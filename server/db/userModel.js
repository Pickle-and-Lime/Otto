var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: String,
  householdId: String,
  invites: [Schema.Types.ObjectId] // ObjectId Of households
});

module.exports = mongoose.model('user', userSchema);
