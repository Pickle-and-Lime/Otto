/**
* This module sets up individual items in the general pantry
* It creates a neural network for each item and sets default values for
* the trainingSet and average time to expiration for each item.
* It also creates methods for creating and updating user-specific pantry items.
* @module PantryItem
* @requires synaptic
*/

var synaptic = require('synaptic');
var Trainer = synaptic.Trainer, Architect = synaptic.Architect;

/**
* Creates a neural network and trainer for an item
* @class PantryItem
* @constructor
* @param item {String}
* the name of the item
*/

var PantryItem = function(item){
  //create the network using a long short term memory architecture
  // that has one input neuron, one hidden neuron, and one output neuron
  this.network = new Architect.LSTM(1, 2, 1);
  //create a trainer for the network
  this.trainer = new Trainer(this.network);
};

/**
* Trains an instance of a pantry item with the given trainingSet
* and exports a standalone (trained) neural network as a
* method for that item with no library dependencies.
* See [Synaptic documentation](https://github.com/cazala/synaptic/wiki/Trainer)
* @method train
* @param trainingSet {Array}
* An array of objects with input and output data for the
* neural network. Ex: `[{input: [1], output: [0.1]},{input: [3], output: [0.9]}]`
* @return {Function}
* see [Synaptic documentation](https://github.com/cazala/synaptic/wiki/Networks#standalone)
*/
PantryItem.prototype.train = function(trainingSet){
  //train the network using the given trainingSet
  this.trainer.train(trainingSet);
  //return a standalone function for the network that 
  //does not rely on any dependencies
  return this.network.standalone(); 
};

module.exports = PantryItem;

