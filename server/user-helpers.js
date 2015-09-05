var mongoose = require('mongoose');
var Household = require('./db/householdModel.js');
var User = require('./db/userModel.js')
var Q = require('q');

module.exports = userHelpers = {

  getHouseholdForUser : function(userId, email) {
    return User.findOne({ userId : userId})
    .then(function(user) {
      // If user exists, return the householdId
      if (user) {
        return Q.fcall(function() {
          return user.householdId;
        })
      } else {
        // If user does not exist, create a new one
        return userHelpers.createUser(userId, email)
        .then(function(newUser) {
          return Q.fcall(function() {
            return newUser.householdId;
          })
        })
      }
    })
  },

  createUser : function(userId, email) {
    // Create new household for the user
    var newHousehold = new Household({});
    newHousehold.users.push(userId);
    return newHousehold.save()
    .then(function() {
      var newUser = new User({
        userId: userId,
        email: email,
        householdId: newHousehold._id
      })

      return newUser.save()
      .then(function() {
        // Return newly created user
        return Q.fcall(function() {
          return newUser;
        })
      })
    })
  }
}