/**
* This module sets up individual items in the general pantry
* It creates a neural network for each item and sets default values for
* the trainingSet and average time to expiration for each item.
* It also creates methods for creating and updating user-specific pantry items.
* @module nn-helpers
*/

var synaptic = require('synaptic');
var Trainer = synaptic.Trainer, Architect = synaptic.Architect;

/**
* Creates an item that will be stored in the general pantry
* @class PantryItem
* @contstructor
* @param item {String}
* the name of the item
*/

var PantryItem = function(item){
  //create the network using a long short term memory architecture
  // that has one input neuron, one hidden neuron, and one output neuron
  this.network = new Architect.LSTM(1, 1, 1);
  //create a trainer for the network
  this.trainer = new Trainer(this.network);
};

/**
* Trains an instance of a pantry item with the given trainingSet
* and exports a standalone (trained) neural network as a
* method for that item with no library dependencies.
* @method train
* @param trainingSet {Array}
* An array of objects with input and output data for the
* neural network. Ex: [{input: [1], output: [0.9]}]
* See [Synaptic documentation](https://github.com/cazala/synaptic/wiki/Trainer)
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

