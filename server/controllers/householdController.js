var mongoose = require('mongoose');
var Household = require('../db/householdModel.js');
var User = require('../db/userModel.js');
var Q = require('q');
var utils = require('./utils.js');

module.exports = householdHelpers = {

  getHousehold : function(householdId) {
    return Household.findById(householdId)
    .then(function(household) {
      return utils.promiseMap(household.users, function(userId){
        return User.findOne({userId: userId});
      })
      .then(function(resolvedUsers) {
        var users = resolvedUsers.map(function(user) {
          user = user.toObject();
          delete user.invites;
          return user;
        });

        return utils.promiseMap(household.sentInvites, function(userId){
          return User.findOne({userId: userId});
        })
        .then(function(resolvedSentInvites) {
          var sentInvites = resolvedSentInvites.map(function(user) {
            user = user.toObject();
            delete user.invites;
            return user;
          });

          household = household.toObject();
          household.users = users;
          household.sentInvites = sentInvites;
          return Q.fcall(function() {
            return household;
          });
        });
      });
    });
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
