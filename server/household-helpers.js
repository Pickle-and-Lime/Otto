var mongoose = require('mongoose');
var Household = require('./db/householdModel.js');

module.exports = householdHelpers = {

  getHousehold : function() {
    // Ideally, this will match a user to a household
    // Right now, we will create one if one doesn't exist
    // and use only that one
    return Household.findOne(function(err, household) {
      if (err) console.error(err);
      console.log(household);
      if (!household) {
        // Create a test household
        var household = new Household({});
        household.save(function() {
          console.log('householdId from helper is ', household._id)
        })
      }
    })
  },

  removeHousehold : function(householdId) {
    return Household.remove({ _id: householdId }, function(err) {
      if (err) console.error(err);
    })
  }
}
