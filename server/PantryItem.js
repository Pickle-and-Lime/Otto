/**
* This module sets up individual items in the general pantry
* It creates a neural network for each item and sets default values for
* the trainingSet and average time to expiration for each item.
* It also creates methods for creating and updating user-specific pantry items.
* @module nn-helpers
*/

var synaptic = require('synaptic');
//coming from the db
var Trainer = synaptic.Trainer, Architect = synaptic.Architect;

/**
* Creates an item that will be stored in the general pantry
* @class PantryItem
* @contstructor
* @param {String} item
* the name of the item
* @param {Object} data
* the default trainingSet and average expiration time
* for the item
*/




var PantryItem = function(item){
  //create the network; input = time since last purchase; output = probability need more
  this.network = new Architect.LSTM(1, 1, 1);
  this.trainer = new Trainer(this.network);
};

/**
* Trains an instance of a pantry item with the given trainingSet
* and exports a standalone (trained) neural network as a
* method for that item with no library dependencies.
* @method train
* @param trainingSet {Array}
* An array of objects with input and output data for the
* neural network. Ex: [{input: [0.014], output: [0.9]}]
* See [Synaptic documentation](https://github.com/cazala/synaptic/wiki/Trainer)
* @return {Function}
* see [Synaptic documentation](https://github.com/cazala/synaptic/wiki/Networks#standalone)
*/
PantryItem.prototype.train = function(trainingSet){
  this.trainer.train(trainingSet);
  var trainedNetwork = this.network.standalone();
  return trainedNetwork; //stringify??
};

/**
* Updates the trainingSet for an item in a household's
* pantry and retrain's the item's neural network using
* the updated trainingSet
* @method update
* @param item{String}
* @param time {Number}
* The time elapsed since the item was last purchased
* @param result {Number}
* The correct output value for when the neural network is
* activated by that amount of time
* @param household {String}
* the name/id with which to access the household's pantry in the database
*/
/*
PantryItem.prototype.update = function(item, time, result, household){
  item = household.pantry[item];
  item.trainingSet.push({input : [time/365], output :[result]});
  item.network = this.train(item.trainingSet);
};
*/

module.exports = PantryItem;

