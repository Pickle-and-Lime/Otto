/**
* Provides methods for creating user pantries and lists
* @module listHelpers
*/

var Household = require('./db/householdModel.js');
var appPantry = require('./db/finalPantry.js');
var PantryItem = require('./PantryItem.js');
var pantryHelpers = require('./pantry-helpers.js');
var Q = require('q');

module.exports = listHelpers = {
  //called to get the length of time since item was purchased
  timeSincePurchase : function(date){
    var diff = (new Date() - date.getTime())/ (24 * 60 * 60 * 1000);
    return Math.round(diff);
  },
  //called when shopper opens app
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
            console.log(item, prob);
            if (prob >0.5){
              household.pantry[item].fullyStocked = false;
              household.markModified('pantry');
              household.save();
            }
          }
          if (!household.pantry[item].fullyStocked){
            household.list[item] = {checked: false};          }
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
        household.list[item] = {checked: false};
        //Mark list modified because it is a mixed datatype in db
        household.markModified('list');
        //Save changes
        household.save();
        
        var itemProps = household.pantry[item];
        //if the item is already in their pantry, update Rosie's data for it
        if (itemProps){
          //calculate how long since last bought
          var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

          // Add the updated training data to pantry item
          itemProps.trainingSet.push({input : [timeElapsed], output :[0.9]});

          //Rebuild the standalone NN with the updated training data
          pantryHelpers.updateItemNetwork(item, itemProps, household, false);
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

  //called when manually removing items added by Rosie (NOT bought)
  removeFromList : function(item, householdId){
    return Household.findOne({ _id: householdId },'pantry list')
    .then(function(household) {
      if (household) {
        //console.log('removeFromList household: ', household);
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

  //called after purchase
  buy : function(items, householdId){
    if (!items.length){
      console.log('No items purchased');
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