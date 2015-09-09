/**
 * Provides methods for creating and updating Users
 * @class userHelpers
 * @static
 */

var mongoose = require('mongoose');
var Household = require('./db/householdModel.js');
var User = require('./db/userModel.js');
var Q = require('q');

module.exports = userHelpers = {

  /**
   *  Retrieves and returns User information.
   *
   *  @method getUser
   *  @param {string}     userId
   *
   *  @return {Promise}   Callback is supplied with User object.
   */
  getUser : function(userId) {
    return User.findOne({ userId : userId})
    .then(function(user) {
      if (!user) throw new Error('Cannot find user');
      return Q.fcall(function() {
        return user;
      });
    });
  },

  /**
   *  Retrieves and returns the householdId for a user.
   *
   *  If the user does not exist, it will create a new user with the
   *  supplied userId and email. In this way, there is no separation
   *  between signing in and signing up from the client's perspective.
   *
   *  @method getHouseholdForUser
   *  @param  {string}    userId
   *  @param  {string}    email
   *
   *  @return {Promise}   Callback is supplied with user's householdId.
   */
  getHouseholdForUser : function(userId, email) {
    return User.findOne({ userId : userId})
    .then(function(user) {
      // If user exists, return the householdId
      if (user) {
        return Q.fcall(function() {
          return user.householdId;
        });
      } else {
        // If user does not exist, create a new one
        return userHelpers.createUser(userId, email)
        .then(function(newUser) {
          return Q.fcall(function() {
            return newUser.householdId;
          });
        });
      }
    });
  },

  /**
   *  Creates a new User and a new Household for that user.
   *  The user is added to the households `users` property.
   *
   *  @method createUser
   *  @param  {string}    userId
   *  @param  {string}    email
   *
   *  @return {Promise}   Callback is supplied with new User object.
   */
  createUser : function(userId, email) {
    // Create new household for the user
    var newHousehold = new Household({});
    newHousehold.users.push({
      userId: userId,
      email: email
    });
    return newHousehold.save()
    .then(function() {
      var newUser = new User({
        userId: userId,
        email: email,
        householdId: newHousehold._id
      });

      return newUser.save()
      .then(function() {
        // Return newly created user
        return Q.fcall(function() {
          return newUser;
        });
      });
    });
  },

  /**
   *  Adds the inviters Household information into the invitee's `invites` property,
   *  and adds invitee's email to the households sent invites list.
   *  If invitation already exists, do nothing and return successfully.
   *
   *  @method createInvitation
   *  @param  {string}    householdId
   *  @param  {string}    inviteeEmail
   *
   *  @return {Promise}   Callback is supplied with invitee's User object.
  */
  createInvitation : function(householdId, inviteeEmail) {
    return Household.findById(householdId)
    .then(function(household) {
      return User.findOne({ email: inviteeEmail })
      .then(function(user) {
        if (!user) throw new Error('Cannot find user');
        user.invites.push({
          householdName: household.name,
          householdId: household._id
        });
        household.sentInvites.push({
          userId: user.userId,
          email: inviteeEmail
        });

        return household.save()
        .then(function() {
          return user.save();
        });
      });
    });
  },

  /**
   *  Accepts or rejects the invitation.
   *
   *  Accepting will change the invitee's HouseholdId to
   *  the creator's householdId, and add the invitee's email
   *  to the creator household's users list.
   *
   *  Both accept and reject will remove the household's invite from
   *  the User's `invites` array, and from the household's `sentInvites` array
   *
   *  @method updateInvitation
   *  @param  {string}    householdId
   *  @param  {string}    inviteeEmail
   *  @param  {boolean}   accept
   *
   *  @return {Promise}   Callback is supplied with invitee's User object
   */
  updateInvitation : function(householdId, inviteeEmail, accept) {
    if (typeof accept !== 'boolean') throw new Error('`Accept` must be a boolean');

    return Household.findById(householdId)
    .then(function(household) {
      return User.findOne({ email: inviteeEmail })
      .then(function(invitee) {
        if (!invitee) throw new Error('Cannot find invitee');

        // Removes invite (and duplicates) from User's invites
        invitee.invites = invitee.invites.filter(function(el) {
          return el.householdId !== householdId;
        });

        // Removes invite (and duplicates) from household's sentInvites
        household.sentInvites = household.sentInvites.filter(function(el) {
          return el.email !== inviteeEmail;
        });

        if (accept) {
          invitee.householdId = householdId;
          household.users.push({
            userId: invitee.userId,
            email: inviteeEmail
          });
        }

        return household.save()
        .then(function() {
          return invitee.save();
        });
      });
    });
  }
};
