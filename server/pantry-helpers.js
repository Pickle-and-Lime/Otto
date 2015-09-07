/**
* Provides methods for creating user pantries
* @module pantryHelpers
*/

var Household = require('./db/householdModel.js');
var appPantry = require('./db/finalPantry.js');
var PantryItem = require('./PantryItem.js');
var Q = require('q');

module.exports = pantryHelpers = {
  //makes a new pantry item nn
  updateItemNetwork: function(item, itemProps, household, fullyStocked){
    // Rebuild the standalone NN with the updated training data
    var pantryItem = new PantryItem(item);
    var trained = pantryItem.train(itemProps.trainingSet);
    // Add new standalone fn to item pantry
    itemProps.network = trained.toString();
    itemProps.fullyStocked = fullyStocked;
    //Mark pantry modified because it is a mixed datatype in db
    household.markModified('pantry');
    //Save changes
    return household.save();
  },
  //called when household adds to pantry from gen list or by checking off
  addToPantry : function(item, householdId, month, day, cb){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household){
      if(household) {
        if (household.pantry === undefined){
          household.pantry = {};
        }
        //stores today's date if no date is passed in
        var date = month ? new Date(2015, month, day) : new Date();
        console.log('ITEM',item);
        //check if the item is in the general pantry
        if (appPantry[item]){
          //train item for that household with their own data if it exists, or with the general data
          var houseTraining = household.pantry[item] ? 
            household.pantry[item].trainingSet : JSON.parse(JSON.stringify(appPantry[item].trainingSet));
          
          // Create and train the neural network
          var pantryItem = new PantryItem(item);
          var trained = pantryItem.train(houseTraining);

          // //set additional properties to 
          // var expiration = household.pantry[item] ?
          //   household.pantry[item].expiration : appPantry[item].expiration;


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
            trainingSet : null,
            date: date,
            fullyStocked : true, 
            expiration : undefined,
            category : undefined,
            tags : undefined,
            seasons : undefined
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

  //called if a user wants to remove something entirely from their pantry
  //in the future, change to "blacklist" instead, and add some logic into 
  //the autoBuild that wouldn't add these items to their shopping list
  //and hide them from displaying in their pantry in the frontend instead of 
  //completely deleting from the db 
  removeFromPantry : function(item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household){
      if (household) {
        delete household.pantry[item];

        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        return household.save()
        .then(function() {
          // Allows removeFromPantry to be chainable
          return Q.fcall(function() {
            return household.pantry;
          });
        });
      } else {
        throw new Error('Household not found');
      }
    });
  },

  //update expiration if desired
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

  getPantry : function(householdId) {
    // Return a specific households pantry
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      if (household) {
        var result = {};
        for (var item in household.pantry) {
          console.log('ITEM', item);
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

  getAppPantry : function() {
    // Simply return a list of the key names in appPantry
    // which are all the products we track
    // The value could be anything the frontend needs
    var result = {};
    for (var item in appPantry) {
      result[item] = true;
    }
    return Q.fcall(function() {
      return result;
    });
  }
};