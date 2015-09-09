var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: String,
  householdId: String,
  invites: [{
    householdName: String,
    householdId: String
  }]
});

module.exports = mongoose.model('user', userSchema);
