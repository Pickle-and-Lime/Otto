var synaptic = require('synaptic');

//coming from the db
var households = require('./db/households-data.js');

var Trainer = synaptic.Trainer, Architect = synaptic.Architect;

module.exports = {
  
  //function to create a generic pantry item
  pantryItem : function(name, data){
    //create the network; input = time since last purchase; output = probability need more
    this.network = new Architect.LSTM(1, 1, 1);
    var trainer = new Trainer(this.network);

    //set the generic expiration date
    this.aveExp = data.aveExp;
    //set the trainingSet property to access/update in the future
    this.initialTrainingSet = data.trainingSet;
    //set the train property to retrain with any trainingSet
    this.train = function(trainingSet){
      trainer.train(trainingSet);
      return this.network.standalone(); //stringify???
    };

    //Update the network as needed
    this.update = function(item, time, result, household){
      households[household].pantry[item].trainingSet.push({input : [time/365], output :[result]});
      households[household].pantry[item].network = this.train(households[household].pantry[item].trainingSet);
    };
    //set the name of the network
    //this.name = name; probably uneccessary now
  }, 

  //to calculate the amount of time since last purchased
  dateDiff : function(date2){
    var diff = (new Date() - date2.getTime())/ (24 * 60 * 60 * 1000);
    return Math.round(diff);
  }
};
