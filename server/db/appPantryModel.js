var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appPantrySchema = new Schema({
  name: { type: String },
  data: { type: Schema.Types.Mixed }
}, { minimize: false } );

appPantrySchema.methods.train = function(trainingSet){
  var that = this;
  // eval(that.trainer + ".train(" + trainingSet + ")");
  var parsed = JSON.parse(that.data.trainer);
  eval("var trainer = " + parsed.train);
  parsed.train = trainer;
  parsed.train(trainingSet);
  eval("var trainedNetwork =" + that.network + ".standalone()");
  return trainedNetwork; //stringify??
};

module.exports = mongoose.model('appPantry', appPantrySchema);