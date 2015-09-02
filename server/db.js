/////// DB
var mongoose = require('mongoose');
var User = require('./db/userModel.js');
var Household = require('./db/householdModel.js');
var listHelpers = require('./list-helpers.js');


mongoose.connect('mongodb://localhost/orbit');
var db = mongoose.connection;

db.once('open', function(){
  console.log('Database connection now open!');
});
module.exports = db;

////////////