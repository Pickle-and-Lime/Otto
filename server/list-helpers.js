var helpers = require('./nn-helpers.js');
var appPantry = require('./db/app-pantry.js');
var users = require('./db/users-data.js');

module.exports = {
  //called when user adds to pantry from gen list or by checking off
  buildPantry : function(user, item, month, day){
    //in implementation, no month, day--> just call and store new Date()
    var date = month ? new Date(2015, month, day) : new Date();
    
    //get general item data
    var data = appPantry[item];
    //set correct household size
    var size = users[user].hhSize;

    //create and train new item for that user
    var newItem = new helpers.newItem(item, data, size);
    
    //add item to the users pantry; will be to database
    users[user].pantry[item] = {
      item: newItem, 
      date: date,
    }; 
    return users[user].pantry;
  },

  //called when shopper opens app
  autoBuildList : function(user){
    var dateBought, timeElapsed;
    //set user, list, and pantry
    user = users[user];
    user.list = {};
    var pantry = user.pantry;

    //loop over everything in the pantry and determine if it should be added to the list
    for (var thing in pantry) {
      //get item
      item = pantry[thing].item;

      //calculate how long since last bought
      timeElapsed = helpers.dateDiff(pantry[thing].date);
      //add the item to the list if nn calculates a >50% prob it's out
      if (item.network.activate([timeElapsed/365]) >0.5 || timeElapsed > item.aveExp){
        user.list[item.name] = 'unchecked';
      }

    }
    return user.list;
  },

  //called when manually adding items to list
  manAdd : function(item, user){
    //add the item to the shopping list
    item = users[user].pantry[item];
    users[user].list[item.item.name] = 'unchecked'; //item;

    //calculate how long since last bought
    var timeElapsed = helpers.dateDiff(item.date);

    //update the NN with the new data
    item.item.update(timeElapsed, 0.9);
  },

  //called when manually removing items added by Rosie (NOT bought)
  manRemove : function(item, user){
    //remove the item from the user's shopping list
    delete users[user].list[item];

    //calculate how long since last bought
    var timeElapsed = helpers.dateDiff(users[user].pantry[item].date);

    //update network with new data
    users[user].pantry[item].item.update(timeElapsed, 0.1);
  },

  //called while shopping to mark/unmark items
  check : function(item, user){
    if (users[user].list[item] === 'checked'){
      users[user].list[item] = 'unchecked';
    } else{
      users[user].list[item] = 'checked';
    }
  },

  //called after purchase
  bought : function(user){
    //loop through the list
    for (var item in users[user].list){
      
      //see if "checked"
      if (users[user].list[item] === 'checked'){
        
        //update the date to today
        users[user].pantry[item].date = new Date();
        
        //delete the item from the shopping list
        delete users[user].list[item];
      }
    }
  }
};