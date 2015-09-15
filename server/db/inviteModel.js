var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inviteSchema = new Schema({
  inviteId: { type: String, required: true, unique: true },
  householdId: { type: Schema.Types.ObjectId },
  inviteeEmail: String
});

module.exports = mongoose.model('invite', inviteSchema);
