/**
* Provides methods for creating household pantries and lists
* @module groceryHelpers
* @requires Household, appPantry, PantryItem, pantryHelpers, Q
*/

var Household = require('../db/householdModel.js');
var appPantry = require('../db/finalPantry.js').pantry;
var PantryItem = require('./PantryItem.js');
var pantryHelpers = require('./pantryController.js');
var Q = require('q');

/** 
* Provides methods for manipulating household shopping lists
* @class itemHelpers
* @static
*/

module.exports = itemHelpers = {

  /**
  * Adds new tags to an item in a household's shopping list, and saves it in the pantry for future use
  * @method addTag
  * @param tag {String}
  * @param item {String}
  * @param householdId {String}
  */
  addTag : function(tag, item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry list')
    .then(function(household) {
      household.pantry[item].tags.push(tag);
      if (household.list[item]){
        household.list[item].tags.push(tag);
      }
      //Mark list modified because it is a mixed datatype in db
      household.markModified('pantry');
      household.markModified('list');
      //Save changes
      return household.save();
    });
  }, 

  /**
  * Edits data associated with an item in a household's pantry
  * @method editItem
  * @param category {String}
  * The category to which the item belongs
  * @param expiration {String}
  * The estimated expiration time for an item
  * @param purchased {String}
  * The date the item was last purchased
  * @param item {String}
  * @param householdId {String}
  */
  editItem : function(category, expiration, purchased, item, householdId){
    return Household.findOne({ _id: householdId }, 'pantry')
    .then(function(household) {
      household.pantry[item].category = category;
      household.pantry[item].expiration = expiration;
      household.pantry[item].date = purchased;
      //Mark list modified because it is a mixed datatype in db
      household.markModified('pantry');
      //Save changes
      return household.save();
    });
  },
};