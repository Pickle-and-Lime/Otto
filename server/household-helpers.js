var mongoose = require('mongoose');
var Household = require('./db/householdModel.js');
var Q = require('q');

module.exports = householdHelpers = {

  getHousehold : function() {
    // Ideally, this will match a user to a household
    // Right now, we will create one if one doesn't exist
    // and use only that one
    return Household.findOne()
    .then(function(household) {
      if (!household) {
        // Create a test household
        var newHousehold = new Household({});
        return newHousehold.save()
        .then(function(household) {
          return household._id;
        });
      } else {
        return Q.fcall(function() {
          return household._id;
        });
      }
    });
  },

  removeHousehold : function(householdId) {
    return Household.remove({ _id: householdId }, function(err) {
      if (err) console.error(err);
    });
  }
};
