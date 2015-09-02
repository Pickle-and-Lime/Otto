/**
* Provides methods for creating user pantries and lists
* @module listHelpers
*/

//This will be coming from the db instead--> watch out anywhere these are used
var appPantry = require('./db/app-pantry.js');
// var households = require('./db/households-data.js');
var mongoose = require('mongoose');
var User = require('./db/userModel.js');
var Household = require('./db/householdModel.js');
var Q = require('q');

module.exports = listHelpers = {
  //called when household adds to pantry from gen list or by checking off
  addToPantry : function(item, householdId, month, day){
    Household.findOne({ _id: householdId }, 'pantry', function(err, household){
      if(err){
        console.error('Error',err);
      }
      if (household.pantry === undefined){
        household.pantry = {};
      }
      //stores today's date if no date is passed in
      var date = month ? new Date(2015, month, day) : new Date();
      //check if the item is in the general pantry
      //This and other calls for appPantry will need to be refactored to use the db
      if (appPantry[item]){
        //train item for that household with their own data if it exists, or with the general data
        var houseTraining = household.pantry[item] ? 
          household.pantry[item].trainingSet : JSON.parse(JSON.stringify(appPantry[item].initialTrainingSet));
        
        var expTime = household.pantry[item] ?
          household.pantry[item].expTime : appPantry[item].aveExp;

          household.pantry[item] = {
            network: appPantry[item].train(houseTraining).toString(), //might be able to convert this to a string with standalone
            trainingSet : houseTraining,
            date: date,
            expTime : expTime, 
            fullyStocked : true, 
            tracked : true
          };
        // var network = appPantry[item].train(houseTraining);
        //add item to the households pantry; will be to database
        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save(); 
          
        // });
      } else {
        //add it as an untracked item if it doesn't exist in the general pantry
        household.pantry[item] = {
          network: null, //might be able to convert this to a string with standalone
          trainingSet : null,
          date: date,
          expTime : undefined, 
          fullyStocked : true, 
          tracked : false
        }; 
        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();
      }
    });
  },

  //called if a user wants to remove something entirely from their pantry
  //in the future, change to "blacklist" instead, and add some logic into 
  //the autoBuild that wouldn't add these items to their shopping list
  //and hide them from displaying in their pantry in the frontend instead of 
  //completely deleting from the db 
  removeFromPantry : function(item, householdId){
    Household.findOne({ _id: householdId }, 'pantry', function(err, household){
      if(err){
        console.error(err);
      } 
      
      delete household.pantry[item];

      //Mark pantry modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      household.save();
    });
  },

  //update expTime if desired
  updateExpTime : function(item, householdId, time){
    Household.findOne({ _id: householdId }, 'pantry', function(err, household){
      if(err){
        console.error(err);
      }

      household.pantry[item].expTime = time;

      //Mark pantry modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      household.save();
    });
  },
  timeSincePurchase : function(date){
    var diff = (new Date() - date.getTime())/ (24 * 60 * 60 * 1000);
    return Math.round(diff);
  },
  //called when shopper opens app
  autoBuildList : function(householdId){
    Household.findOne({ _id: householdId }, 'pantry', function(err, household){
      var timeElapsed;
      if (household.list === undefined){
        household.list = {};
      }
      //set household, list, and pantry
      //or otherwise empty
      var pantry = household.pantry;
      //loop over everything in the pantry and determine if it should be added to the list
      for (var item in household.pantry) {
        //calculate how long since last bought
        timeElapsed = listHelpers.timeSincePurchase(pantry[item].date);
        //add the item to the list if it's past it's expiration
        if (timeElapsed > item.expTime){
          household.list[item] = item;
          pantry[item].fullyStocked = false;
        }

        //if it is a tracked item and Rosie thinks it's out, add it
        else if (appPantry[item]){
          eval("var network = "+household.pantry[item].network);
          var prob = network([timeElapsed/365]);
          console.log('Item', item,'Prob', prob);
          if (prob >0.5){
            household.list[item] = item;
            household.pantry[item].fullyStocked = false;
          }
        }
      }
      //Mark pantry modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      household.save();
    });

  },

  //called when manually adding items to list
  addToList : function(item, householdId){
    Household.findOne({ _id: householdId }, 'pantry', function(err, household){
      var itemProps = household.pantry[item];

    //if the item is already in their pantry, update Rosie's data for it
    if (itemProps){
      //calculate how long since last bought
      var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

      //update the NN with the new data
      appPantry[item].update(item, timeElapsed, 0.9, household);
      }
      //otherwise, add it to their pantry
      else {
        listHelpers.addToPantry(item, householdId);

        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();
      }
    });
    setTimeout(function(){

    Household.findOne({_id: householdId}, 'pantry list', function(err, household){
        console.log(household.list);
        //add the item to the shopping list
        household.list[item] = item;
        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('list');
        //Save changes
        household.save();
        setTimeout(function(){console.log(household.list);},1000);
        household.pantry[item].fullyStocked = false;

        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();

    });
    },1500);
  },

  //called when manually removing items added by Rosie (NOT bought)
  removeFromList : function(item, householdId){
    Household.findOne({ _id: householdId },'pantry list', function(err, household){
      var itemProps = household.pantry[item];
      
      //remove the item from the household's shopping list
      delete household.list[item];
      household.markModified('list');
      household.save();
      //calculate how long since last bought
      var timeElapsed = listHelpers.timeSincePurchase(itemProps.date);

      //update network with new data
      appPantry[item].update(item, timeElapsed, 0.1, household);

      //restock in pantry
      itemProps.fullyStocked = true;
      //Mark pantry modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      household.save();
    });
  },

  // //called while shopping to mark/unmark items if the frontend doesn't
  // check : function(item, household){
  //   if (households[household].list[item] === 'checked'){
  //     households[household].list[item] = 'unchecked';
  //   } else{
  //     households[household].list[item] = 'checked';
  //   }
  // },

  //called after purchase
  buy : function(items, householdId){
    Household.findOne({ _id: householdId }, 'pantry list', function(err, household){
      items.forEach(function(item){
        //update the date to today
        household.pantry[item].date = new Date();
        household.pantry[item].fullyStocked = true;     
        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('pantry');
        //Save changes
        household.save();
        //delete the item from the shopping list
        delete household.list[item];
        //Mark pantry modified because it is a mixed datatype in db
        household.markModified('list');
        //Save changes
        household.save();

      });
    }); 
  }
  //if the frontend doesn't keep track of checked/unchecked
  //   //loop through the list
  //   for (var item in households[household].list){
      
  //     //see if "checked"
  //     if (households[household].list[item] === 'checked'){
        
  //       //update the date to today
  //       households[household].pantry[item].date = new Date();
        
  //       //delete the item from the shopping list
  //       delete households[household].list[item];
  //     }
  //   }
  // }
};