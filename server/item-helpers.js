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
* @class itemHelpers
* @static
*/

module.exports = itemHelpers = {
  addTag : function(tag, item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household) {
      console.log('Before pantry',household.pantry[item].tags);
      household.pantry[item].tags.push(tag);
      console.log('After pantry',household.pantry[item].tags);
      if (household.list[item]){
      console.log('Before list',household.pantry[item].tags);
        household.list[item].tags.push(tag);
      console.log('After list',household.pantry[item].tags);
      }
      //Mark list modified because it is a mixed datatype in db
      household.markModified('pantry');
      household.markModified('list');
      //Save changes
      return household.save();
    });
  }, 

  editItem : function(expiration, purchased, item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      household.pantry[item].expiration = expiration;
      household.pantry[item].date = purchased;
      //Mark list modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      return household.save();
    });
  },
};