var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var householdSchema = new Schema({
  name: {type: String, default: ''},
  pantry: { type: Schema.Types.Mixed},
  list: {type: Schema.Types.Mixed},
  users: [{
    userId: String,
    email: {type: String, lowercase: true}
  }],
  sentInvites: [{
    userId: String,
    email: {type: String, lowercase: true}
  }],
}, { minimize: false } );

module.exports = mongoose.model('household', householdSchema);