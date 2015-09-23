/**
* Provides methods for creating household pantries and lists
* @module listCtrl
* @requires householdModel, appPantry, PantryItem, pantryController, Q
*/

var Household = require('../db/householdModel.js');
var appPantry = require('../db/finalPantry.js').pantry;
var PantryItem = require('./PantryItem.js');
var pantryController = require('./pantryController.js');
var itemController = require('./itemController.js');
var Q = require('q');

/** 
* Provides methods for manipulating household shopping lists
* @class listCtrl
* @static
*/

module.exports = listCtrl = {

  /**
  * Generates a shopping list for a household based upon the length of time since
  * the item was last purchased, and Otto's calculated probability that the 
  * household has run out of that item.
  * @method autoBuildList
  * @param householdId {String}
  * the string that identifies a household in the database
  */  
  autoBuildList : function(householdId){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household) {
      if (household) {
        var timeElapsed;
        if (household.list === undefined){
          household.list = {};
        }
        var pantry = household.pantry;
        //loop over everything in the pantry and determine if it should be added to the list
        for (var item in household.pantry) {
          //calculate how long since last bought
          timeElapsed = itemController.timeSincePurchase(pantry[item].date);

          //if it is a tracked item and Otto thinks it's out, add it
          if (household.pantry[item].tracked){
            //Execute stringified function
            eval("var network = "+household.pantry[item].network);
            var prob = network([timeElapsed]);
            if (prob >0.5){
              household.pantry[item].fullyStocked = false;
              household.markModified('pantry');
              household.save();
            }
          }
          if (!household.pantry[item].fullyStocked && !household.list[item]){
            household.list[item] = {checked: false, tags: pantry[item].tags, category: pantry[item].category};          
          }
        }

        //Mark pantry and list modified because they are of mixed datatype in db
        household.markModified('pantry');
        household.markModified('list');
        //Save changes
        return household.save()
        .then(function() {
          return Q.fcall(function() {
            return household.list;
          });
        });
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Adds an item to a household's shopping list.
  * If the item is not already in their pantry, it adds it to the pantry as well.
  * If the item is already in their pantry, it updates Otto's neural network
  * to train it to add the item to the list sooner.
  * @method addToList
  * @param item {String}
  * the name of the item
  * @param householdId {String}
  * the string that identifies a household in the database
  */
  addToList : function(item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household) {
      if (household) {
        if (household.pantry === undefined){
          household.pantry = {};
        }
        if (household.list === undefined){
          household.list = {};
        }
        //add the item to the shopping list
        household.list[item] = {checked: false};
        //add available tags
        if (household.pantry[item]){
          household.list[item].tags = household.pantry[item].tags;
          household.list[item].category = household.pantry[item].category;
        } else if (appPantry[item]){
          household.list[item].tags = appPantry[item].tags;
          household.list[item].category = appPantry[item].category;          
        }
        //Mark list modified because it is a mixed datatype in db
        household.markModified('list');
        //needed to pass specs, though behavior seems ok in app without these
        household.save();
        var itemProps = household.pantry[item];
        //if the item is already in their pantry, update Otto's data for it
        if (itemProps){
          //calculate how long since last bought
          var timeElapsed = itemController.timeSincePurchase(itemProps.date);
          if (timeElapsed > 0) {
            // Add the updated training data to pantry item
            itemProps.trainingSet.push({input : [timeElapsed], output :[0.9]});
          }

          //Rebuild the standalone NN with the updated training data
          return pantryController.updateItemNetwork(item, itemProps, household, false);
        } 
        //otherwise, add it to their pantry
        else {
          //Save changes
          return household.save()
          .then(function() {
            return Q.fcall(function() {
              return household.list;
            });
          });
        }
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Removes an item from a household's shopping list is the user
  * doesn't want it there, but hasn't purchased it.
  * It also updates Otto's neural network to train it to 
  * add the item to the list later.
  * @method removeFromList
  * @param item {String}
  * the name of the item
  * @param householdId {String}
  * the string that identifies a household in the database
  */
  removeFromList : function(item, householdId){
    return Household.findOne({ _id: householdId },'pantry list')
    .then(function(household) {
      if (household) {
        var itemProps = household.pantry[item];
        
        //remove the item from the household's shopping list
        delete household.list[item];
        household.markModified('list');
        
        //Save changes
        return household.save()
        .then(function(){
          //calculate how long since last bought
          if (itemProps){
            var timeElapsed = itemController.timeSincePurchase(itemProps.date);

            //Update items tracked by Otto
            if(itemProps.trainingSet){
              // Add the updated training data to pantry item
              
              itemProps.trainingSet.push({input : [timeElapsed], output :[0.1]});
              

             //Rebuild the standalone NN with the updated training data
             pantryController.updateItemNetwork(item, itemProps, household, true)
             .then(function() {
               return Q.fcall(function() {
                 return household.list;
               });
             });

            }
            else{
              //restock in pantry
              itemProps.fullyStocked = true;
              //Mark pantry and list modified because they are of mixed datatype in db
              household.markModified('list');
              household.markModified('pantry');
              
              //Save changes
              return household.save()
              .then(function() {
                return Q.fcall(function() {
                  return household.list;
                });
              });
            }
          }
        });

      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Removes an item from a household's shopping list, updating
  * the last purchased date for that item in the pantry and setting
  * it's `fullyStocked` property to `true`.
  * @method buy
  * @param items {Array}
  * an array of the names of the items
  * @param householdId {String}
  * the string that identifies a household in the database
  */
  buy : function(items, householdId){
    if (!items.length){
      throw new Error("items not purchased");
    }
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household){
      if (household) {
        var toPantry = [];

        items.forEach(function(item) {
          //update the date to today
          //delete the item from the shopping list
          delete household.list[item];
          if (household.pantry[item]){
            household.pantry[item].date = new Date();
            household.pantry[item].fullyStocked = true;     
            // household.pantry[item].tags.push(item.userTags);   
          } else {
            toPantry.push(item);
          }
        });
        //Mark pantry and list modified because they are of mixed datatype in db
        household.markModified('pantry');
        household.markModified('list');
        
        //Save changes
        household.save();        
        
        function add(items){
          return items.reduce(function(curr, next){
            return curr.then(function(){
              return pantryController.addToPantry(next, householdId);
            });
          }, Q());
        }
        
        return add(toPantry)
        .then(function() {
          return Q.fcall(function() {
            // May need to return something here
            return household;
          });
        });
      } else {
        throw new Error('Household not found');
      }
    }); 
  }
};