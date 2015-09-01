var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String
});

module.exports = mongoose.model('user', userSchema);
