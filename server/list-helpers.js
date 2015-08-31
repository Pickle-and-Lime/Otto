var helpers = require('./nn-helpers.js');

//This will be coming from the db instead--> watch out anywhere these are used
var appPantry = require('./db/app-pantry.js');
var households = require('./db/households-data.js');

module.exports = listHelpers = {
  //called when household adds to pantry from gen list or by checking off
  addToPantry : function(item, household, month, day){

    //stores today's date if no date is passed in
    var date = month ? new Date(2015, month, day) : new Date();
    
    //train item for that household with their own data if it exists, or with the general data
    var houseTraining = households[household].pantry[item] ? 
      households[household].pantry[item].trainingSet : JSON.parse(JSON.stringify(appPantry[item].initialTrainingSet));
    
    var expTime = households[household].pantry[item] ?
      households[household].pantry[item].expTime : appPantry[item].aveExp;
    //add item to the households pantry; will be to database
    households[household].pantry[item] = {
      network: appPantry[item].train(houseTraining), //might be able to convert this to a string with standalone
      trainingSet : houseTraining,
      date: date,
      expTime : expTime
    }; 
    return households[household].pantry;
  },

  //called if a user wants to remove something entirely from their pantry
  //in the future, change to "blacklist" instead, and add some logic into 
  //the autoBuild that wouldn't add these items to their shopping list
  //and hide them from displaying in their pantry in the frontend instead of 
  //completely deleting from the db 
  removeFromPantry : function(item, household){
    delete households[household].pantry[item];
  },

  //called when shopper opens app
  autoBuildList : function(household){
    var dateBought, timeElapsed;
    //set household, list, and pantry
    household = households[household];
    household.list = {}; //or otherwise empty
    var pantry = household.pantry;

    //loop over everything in the pantry and determine if it should be added to the list
    for (var item in pantry) {
      //calculate how long since last bought
      timeElapsed = helpers.dateDiff(pantry[item].date);
      //add the item to the list if nn calculates a >50% prob it's out
      var prob = pantry[item].network([timeElapsed/365]);
      if (prob >0.5 || timeElapsed > item.aveExp){
        household.list[item] = 'unchecked';
      }

    }
    return household.list;
  },

  //called when manually adding items to list
  addToList : function(item, household){
    var itemProps = households[household].pantry[item];

    //if the item is already in their pantry, update Rosie's data for it
    if (itemProps){
      //calculate how long since last bought
      var timeElapsed = helpers.dateDiff(itemProps.date);

      //update the NN with the new data
      appPantry[item].update(item, timeElapsed, 0.9, household);
    }
    //otherwise, add it to their pantry
    else {
      listHelpers.addToPantry(item, household);
    }

    //add the item to the shopping list
    households[household].list[item] = 'unchecked'; //item;

  },

  //called when manually removing items added by Rosie (NOT bought)
  removeFromList : function(item, household){
    //remove the item from the household's shopping list
    delete households[household].list[item];
    var itemProps = households[household].pantry[item];
    //calculate how long since last bought
    var timeElapsed = helpers.dateDiff(itemProps.date);

    //update network with new data
    appPantry[item].update(item, timeElapsed, 0.1, household);
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
  buy : function(items, household){ 
    items.forEach(function(item){
      //update the date to today
      households[household].pantry[item].date = new Date();
              
      //delete the item from the shopping list
      delete households[household].list[item];
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