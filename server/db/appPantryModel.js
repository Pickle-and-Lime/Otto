var mongoose = require('mongoose');
var Schema = mongoose.schema;

var appPantrySchema = new Schema({
  generalPantry: { type: Schema.Types.Mixed, default: {} }
}, { minimize: false } );

module.exports = mongoose.model('appPantry', appPantrySchema);