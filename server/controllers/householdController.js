var mongoose = require('mongoose');
var Household = require('../db/householdModel.js');
var Q = require('q');

module.exports = householdHelpers = {

  getHousehold : function(householdId) {
    return Household.findById(householdId);
  },

  updateHousehold : function(householdId, name) {
    return Household.findById(householdId)
    .then(function(household) {
      household.name = name;
      return household.save();
    });
  },

  removeHousehold : function(householdId) {
    return Household.remove({ _id: householdId }, function(err) {
      if (err) console.error(err);
    });
  }
};
