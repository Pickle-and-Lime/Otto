/**
* Provides methods for creating household pantries and lists
* @module groceryHelpers
* @requires Household, appPantry, PantryItem, pantryHelpers, Q
*/

var Household = require('./db/householdModel.js');
var appPantry = require('./db/finalPantry.js').pantry;
var PantryItem = require('./PantryItem.js');
var pantryHelpers = require('./pantry-helpers.js');
var Q = require('q');

/** 
* Provides methods for manipulating household shopping lists
* @class listHelpers
* @static
*/

module.exports = listHelpers = {
  /**
  * Calculate the amount of time that has passed since the item was purchased
  * @method timeSincePurchase
  * @param date {Date}
  * the date the item was last purchased
  * @return {Number}
  * the time in days since the item was last purchased
  */  
  timeSincePurchase : function(date){
    var diff = (new Date() - date.getTime())/ (24 * 60 * 60 * 1000);
    return Math.round(diff);
  },

  /**
  * Generates a shopping list for a household based upon the length of time since
  * the item was last purchased, and Rosie's calculated probability that the 
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
          timeElapsed = listHelpers.timeSincePurchase(pantry[item].date);

          //if it is a tracked item and Rosie thinks it's out, add it
          if (household.pantry[item].tracked){
            //Execute stringified function
            eval("var network = "+household.pantry[item].network);
            var prob = network([timeElapsed]);
            // console.log(item, prob);
            if (prob >0.5){
              household.pantry[item].fullyStocked = false;
              household.markModified('pantry');
              household.save();
            }
          }
          if (!household.pantry[item].fullyStocked){
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
  * If the item is already in their pantry, it updates Rosie's neural network
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
        //needed to pass specs, though behavior seems ok in app without these
        household.markModified('list');
        household.save();
        
        var itemProps = household.pantry[item];
        //if the item is already in their pantry, update Rosie's data for it
        if (itemProps){
          //add available tags
          household.list[item].tags = household.pantry[item].tags;
          household.list[item].category = household.pantry[item].category;
          //Mark list modified because it is a mixed datatype in db
          household.markModified('list');
          //calculate how long since last bought
          var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);
          if (timeElapsed > 0) {
            // Add the updated training data to pantry item
            itemProps.trainingSet.push({input : [timeElapsed], output :[0.9]});
          }

          //Rebuild the standalone NN with the updated training data
          return pantryHelpers.updateItemNetwork(item, itemProps, household, false);
        } 
        //otherwise, add it to their pantry
        else {
          return pantryHelpers.addToPantry(item, householdId)
          .then(function(household) {
            if (household) {
              //Mark list modified because it is a mixed datatype in db
              household.pantry[item].fullyStocked = false;

              //Mark pantry modified because they are of mixed datatype in db
              household.markModified('pantry');
              
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
        }
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Removes an item from a household's shopping list is the user
  * doesn't want it there, but hasn't purchased it.
  * It also updates Rosie's neural network to train it to 
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
          var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

          //Update items tracked by Rosie
          if(itemProps.trainingSet){
            // Add the updated training data to pantry item
            
            itemProps.trainingSet.push({input : [timeElapsed], output :[0.1]});
            

           //Rebuild the standalone NN with the updated training data
           pantryHelpers.updateItemNetwork(item, itemProps, household, true)
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
        items.forEach(function(item) {
          //update the date to today
          household.pantry[item].date = new Date();
          household.pantry[item].fullyStocked = true;     
          
          //delete the item from the shopping list
          delete household.list[item];   
        });
        //Mark pantry and list modified because they are of mixed datatype in db
        household.markModified('pantry');
        household.markModified('list');
        
        //Save changes
        return household.save()
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