var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userId: String,
  email: String,
  householdId: String,
  invites: []
});

module.exports = mongoose.model('user', userSchema);
