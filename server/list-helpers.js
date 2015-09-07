/**
* Provides methods for creating user pantries and lists
* @module listHelpers
*/

var mongoose = require('mongoose');
var User = require('./db/userModel.js');
var Household = require('./db/householdModel.js');
var appPantry = require('./db/finalPantry.js');
var PantryItem = require('./PantryItem.js');
var Q = require('q');

module.exports = listHelpers = {
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

        //check if the item is in the general pantry
        if (appPantry[item]){
          //train item for that household with their own data if it exists, or with the general data
          var houseTraining = household.pantry[item] ? 
            household.pantry[item].trainingSet : JSON.parse(JSON.stringify(appPantry[item].trainingSet));
          
          var expTime = household.pantry[item] ?
            household.pantry[item].expTime : appPantry[item].aveExp;

          // Create and train the neural network
          var pantryItem = new PantryItem(item);
          var trained = pantryItem.train(houseTraining);

          household.pantry[item] = {
            // Store the standalone function inside the database
            network: trained.toString(),
            trainingSet : houseTraining,
            date: date,
            expTime : expTime, 
            fullyStocked : true,
            tracked : true
          };
          //Mark pantry modified because it is a mixed datatype in db
          household.markModified('pantry');
          //Save changes
          return household.save()
          .then(function() {
            // Allows addToPantry to be chainable
            return Q.fcall(function() {
              return household.pantry;
            });
          });

        } else {
          //add it as an untracked item if it doesn't exist in the general pantry
          household.pantry[item] = {
            network: null,
            trainingSet : null,
            date: date,
            expTime : undefined, 
            fullyStocked : true, 
            tracked : false
          }; 
          //Mark pantry modified because it is a mixed datatype in db
          household.markModified('pantry');
          //Save changes
          return household.save()
          .then(function() {
            // Allows addToPantry to be chainable
            return Q.fcall(function() {
              return household.pantry;
            });
          });

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

  //update expTime if desired
  updateExpTime : function(item, householdId, time){
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      if(household){
        household.pantry[item].expTime = time;

        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();
      } else {
        throw new Error('Household not found');
      }
    });
  },
  timeSincePurchase : function(date){
    var diff = (new Date() - date.getTime())/ (24 * 60 * 60 * 1000);
    return Math.round(diff);
  },
  //called when shopper opens app
  autoBuildList : function(householdId){
    return Household.findOne({ _id: householdId }, 'pantry')
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
          //add the item to the list if it's past it's expiration
          if (timeElapsed > pantry[item].expTime){
            household.list[item] = item;
            pantry[item].fullyStocked = false;
          }

          //if it is a tracked item and Rosie thinks it's out, add it
          else if (household.pantry[item].tracked){
            //Execute stringified function
            eval("var network = "+household.pantry[item].network);
            var prob = network([timeElapsed/365]);
            if (prob >0.5){
              household.list[item] = item;
              household.pantry[item].fullyStocked = false;
            }
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

  //called when manually adding items to list
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
        household.list[item] = item;
        
        var itemProps = household.pantry[item];
        //if the item is already in their pantry, update Rosie's data for it
        if (itemProps){
          //calculate how long since last bought
          var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

          // Add the updated training data to pantry item
          itemProps.trainingSet.push({input : [timeElapsed/365], output :[0.9]});

          // Rebuild the standalone NN with the updated training data
          var pantryItem = new PantryItem(item);
          var trained = pantryItem.train(itemProps.trainingSet);
          // Add new standalone fn to item pantry
          itemProps.network = trained.toString();

          //Mark pantry modified because it is a mixed datatype in db
          household.markModified('list');
          household.markModified('pantry');
          //Save changes
          return household.save()
          .then(function() {
            return Household.findOne({_id: householdId}, 'pantry list')
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
          });
        }
        //otherwise, add it to their pantry
        else {
          return listHelpers.addToPantry(item, householdId)
          .then(function(household) {
            if (household) {
              //Mark list modified because it is a mixed datatype in db
              household.pantry[item].fullyStocked = false;

              //Mark pantry modified because they are of mixed datatype in db
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
        }
      } else {
        throw new Error('Household not found');
      }
    })
  },

  //called when manually removing items added by Rosie (NOT bought)
  removeFromList : function(item, householdId){
    return Household.findOne({ _id: householdId },'pantry list')
    .then(function(household) {
      if (household) {
        //console.log('removeFromList household: ', household);
        var itemProps = household.pantry[item];
        
        //remove the item from the household's shopping list
        delete household.list[item];
        
        //calculate how long since last bought
        var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

        //Update items tracked by Rosie
        if(itemProps.trainingSet){
          // Add the updated training data to pantry item
          
          itemProps.trainingSet.push({input : [timeElapsed/365], output :[0.1]});
          

          // Rebuild the standalone NN with the updated training data
          var pantryItem = new PantryItem(item);
          var trained = pantryItem.train(itemProps.trainingSet);

          // Add new standalone fn to item pantry
          itemProps.network = trained.toString();
        }

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

      } else {
        throw new Error('Household not found');
      }
    });
  },

  //called after purchase
  buy : function(items, householdId){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household){
      if (household) {
        items.forEach(function(item) {
          //update the date to today
          household.pantry[item].date = new Date();
          household.pantry[item].fullyStocked = true;     
          
          //delete the item from the shopping list
          delete household.list[item];
          
          //Mark pantry and list modified because they are of mixed datatype in db
          household.markModified('pantry');
          household.markModified('list');
          
          //Save changes
          return household.save()
          .then(function() {
            return Q.fcall(function() {
              // May need to return something here
              return;
            });
          });
        });
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
          result[item] = {
            tracked: household.pantry[item].tracked,
            fullyStocked: household.pantry[item].fullyStocked,
            date: household.pantry[item].date,
          };
        }
        return Q.fcall(function() {
          return result;
        })
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
    })
  }
};