/**
* Provides methods for creating household pantries and lists
* @module groceryHelpers
* @requires Household, appPantry, PantryItem, pantryHelpers, Q
*/

var Household = require('../db/householdModel.js');
var finalPantry = require('../db/finalPantry.js');
var appPantry = finalPantry.pantry;
var categories = finalPantry.categories;
var PantryItem = require('./PantryItem.js');
var Q = require('q');

/** 
* Provides methods for manipulating household shopping lists
* @class pantryHelpers
* @static
*/

module.exports = pantryHelpers = {
  /**
  * Updates a household item's neural network with additional
  * training data provided when a user adds or removes an
  * item from their shopping list.
  * @method updateItemNetwork
  * @param item {String}
  * the name of the item to update
  * @param itemProps {Object}
  * the current properties of the item in the household's pantry
  * @param household {Object}
  * the household object returned from the database
  * @param fullyStocked {Boolean}
  * if true, the item is fully stocked, if false, it is not
  */
  updateItemNetwork: function(item, itemProps, household, fullyStocked){
    // Rebuild the standalone NN with the updated training data
    var pantryItem = new PantryItem(item);
    var trained = pantryItem.train(itemProps.trainingSet);
    // Add new standalone fn to item pantry
    itemProps.network = trained.toString();
    itemProps.fullyStocked = fullyStocked;
    itemProps.tracked = true;
    //Mark pantry modified because it is a mixed datatype in db
    household.markModified('pantry')
    //Save changes
    return household.save();
  },

  /**
  * Adds an item to a household's pantry when they either purchase the item, 
  * or add it from the app's general pantry list.
  * @method addToPantry
  * @static
  * @param item {String}
  * the name of the item
  * @param householdId {String}
  * the string that identifies a household in the database
  * @param [month=now] {String}
  * allows manual input of the month the item was last purchased
  * @param [day=now] {String}
  * allows manual input of the day the item was last purchased
  */
  addToPantry : function(item, householdId, month, day, cb){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household){
      if(household) {
        if (household.pantry === undefined){
          household.pantry = {};
        }
        //stores today's date if no date is passed in
        var date = month ? new Date(2015, month, day) : new Date();
        //check if the item is in the general pantry
        if (appPantry[item]){
          //train item for that household with their own data if it exists, or with the general data
          var houseTraining = household.pantry[item] ? 
            household.pantry[item].trainingSet : JSON.parse(JSON.stringify(appPantry[item].trainingSet));
          
          // Create and train the neural network
          var pantryItem = new PantryItem(item);
          var trained = pantryItem.train(houseTraining);

          household.pantry[item] = {
            // Store the standalone function inside the database
            tracked : true,
            network: trained.toString(),
            trainingSet : houseTraining,
            date: date,
            fullyStocked : true,
            expiration : appPantry[item].expiration,
            category : appPantry[item].category,
            tags : appPantry[item].tags,
            seasons : appPantry[item].seasons
          };
          //Mark pantry modified because it is a mixed datatype in db
          household.markModified('pantry');
          //Save changes
          return household.save();

        } else {
          //add it as an untracked item if it doesn't exist in the general pantry
          household.pantry[item] = {
            tracked : false,
            network: null,
            trainingSet : [],
            date: date,
            fullyStocked : true, 
            expiration : undefined,
            category : undefined,
            tags : [],
            seasons : []
          }; 
          //Mark pantry modified because it is a mixed datatype in db
          household.markModified('pantry');
          //Save changes
          return household.save();

        }
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Completely removes an item from a households's pantry
  * @method removeFromPantry
  * @param item {String}
  * the name of the item
  * @param householdId {String}
  * the string that identifies a household in the database
  */

  //in the future, change to "blacklist" instead, and add some logic into 
  //the autoBuild that wouldn't add these items to their shopping list
  //and hide them from displaying in their pantry in the frontend instead of 
  //completely deleting from the db 
  removeFromPantry : function(item, householdId){
    return Household.findOne({ _id: householdId }, 'list pantry')
    .then(function(household){
      if (household) {
        //remove item from the pantry
        delete household.pantry[item];
        //remove the item from the household's shopping list if it is there
        delete household.list[item];
        
        //Mark list and pantry modified because they are a mixed datatype in db
        household.markModified('list');
        household.markModified('pantry');
        //Save changes
        return household.save()
        .then(function() {
          // Allows removeFromPantry to be chainable
          return Q.fcall(function() {
            return household.pantry;
            // return household;
          });
        });
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Updates an item's default expiration time
  * @method updateExpTime
  * @param item {String}
  * the name of the item
  * @param householdId {String}
  * the string that identifies a household in the database
  * @param time {Number}
  * the length of time (in days) from purchase to expiration
  */
  updateExpTime : function(item, householdId, time){
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      if(household){
        household.pantry[item].expiration = time;

        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();
      } else {
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Return a specific household's pantry
  * @method getPantry
  * @param householdId {String}
  * the string that identifies a household in the database
  * @return {Object}
  * the household's pantry, including the properties of each item
  */
  getPantry : function(householdId) {
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      if (household) {
        var result = {};
        for (var item in household.pantry) {
          result[item] = {
            tracked: household.pantry[item].tracked,
            fullyStocked: household.pantry[item].fullyStocked,
            date: household.pantry[item].date,
            expiration : household.pantry[item].expiration,
            category : household.pantry[item].category,
            tags : household.pantry[item].tags,
            seasons : household.pantry[item].seasons
          };
        }
        return Q.fcall(function() {
          return result;
        });
      } else {
        // Trigger error for router if household is not found
        throw new Error('Household not found');
      }
    });
  },

  /**
  * Return the general pantry
  * @method getPantry
  * @return {Object}
  * the general pantry, including the properties of each item
  */
  getAppPantry : function() {
    // // Simply return a list of the key names in appPantry
    // // which are all the products we track
    // // The value could be anything the frontend needs
    // var result = {};
    // for (var item in appPantry) {
    //   // result[item] = true;
    //   result[item] = { // populating the master pantry list with the category
    //     category: appPantry[item].category
    //   };
    // }
    return Q.fcall(function() {
      return appPantry;
    });
  }, 

  getItemCategories : function(){
    return Q.fcall(function() {
      return categories;
    });
  }
};