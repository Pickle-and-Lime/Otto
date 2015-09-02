var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var householdSchema = new Schema({
  pantry: { type: Schema.Types.Mixed},
  list: {type: Object},
  users: [{type: Schema.Types.ObjectId, default: []}]
}, { minimize: false } );

module.exports = mongoose.model('household', householdSchema);