var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var householdSchema = new Schema({
  pantry: { type: Schema.Types.Mixed, default: {} },
  list: [String],
  users: [Schema.Types.ObjectId]
}, { minimize: false } );

module.exports = mongoose.model('household', householdSchema);