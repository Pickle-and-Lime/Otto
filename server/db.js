/////// DB
var mongoose = require('mongoose');

var DB_URI = process.env.MONGOLAB_URI || 'mongodb://localhost/orbit';
mongoose.connect(DB_URI);
var db = mongoose.connection;

db.once('open', function(){
  console.log('Database connection now open!');
});
module.exports = db;

////////////