/**
* Creates a mongoose model and mongo schema for households
* @module householdModel
* @requires mongoose
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var householdSchema = new Schema({
  name: {type: String, default: ''},
  pantry: { type: Schema.Types.Mixed},
  list: {type: Schema.Types.Mixed},
  users: [{type: String, unique: true}], // UserId
  sentInvites: [{type: String, unique: true}] // UserId
}, { minimize: false } );

/**
* @class householdModel
* @constructor
*/
module.exports = mongoose.model('household', householdSchema);