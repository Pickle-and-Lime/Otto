var helpers = require('./nn-helpers.js');
var appPantry = require('./db/app-pantry.js');
var households = require('./db/households-data.js');

module.exports = {
  //called when household adds to pantry from gen list or by checking off
  buildPantry : function(household, item, month, day){
    //in implementation, no month, day--> just call and store new Date()
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
  manAdd : function(item, household){
    //add the item to the shopping list
    var itemProps = households[household].pantry[item];
    households[household].list[item] = 'unchecked'; //item;

    //calculate how long since last bought
    var timeElapsed = helpers.dateDiff(itemProps.date);

    //update the NN with the new data
    appPantry[item].update(item, timeElapsed, 0.9, household);
    // item.item.update(timeElapsed, 0.9);
  },

  //called when manually removing items added by Rosie (NOT bought)
  manRemove : function(item, household){
    //remove the item from the household's shopping list
    delete households[household].list[item];
    var itemProps = households[household].pantry[item];
    //calculate how long since last bought
    var timeElapsed = helpers.dateDiff(itemProps.date);

    //update network with new data
    appPantry[item].update(item, timeElapsed, 0.1, household);
  },

  //called while shopping to mark/unmark items
  check : function(item, household){
    if (households[household].list[item] === 'checked'){
      households[household].list[item] = 'unchecked';
    } else{
      households[household].list[item] = 'checked';
    }
  },

  //called after purchase
  bought : function(household){
    //loop through the list
    for (var item in households[household].list){
      
      //see if "checked"
      if (households[household].list[item] === 'checked'){
        
        //update the date to today
        households[household].pantry[item].date = new Date();
        
        //delete the item from the shopping list
        delete households[household].list[item];
      }
    }
  }
};