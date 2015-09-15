/**
 * Provides methods for creating and updating Users
 * @module userCtrl
 * @class userCtrl
 * @static
 * @requires Q, householdModel, userModel, utils
 */

var Q = require('q');
var Household = require('../db/householdModel.js');
var User = require('../db/userModel.js');
var Invite = require('../db/inviteModel');
var utils = require('./utils.js');
var email = require('./email.js');

module.exports = userCtrl = {

  /**
   *  Retrieves and returns User information.
   *
   *  @method getUser
   *  @param {string}     userId
   *
   *  @return {Promise}   Callback is supplied with User object. The
   *  User object is slightly modified to not show full details of any
   *  households in its list of invitations
   */
  getUser : function(userId) {
    return User.findOne({ userId : userId})
    .then(function(user) {
      if (!user) throw new Error('Cannot find user');
      // Map over the householdIds and resolve each of them
      // to their respective households
      return utils.promiseMap(user.invites, function(householdId){
        return Household.findById(householdId);
      })
      .then(function(resolvedInvites) {
        var invites = resolvedInvites.map(function(household) {
          household = household.toObject();
          delete household.sentInvites;
          delete household.users;
          return household;
        });
        // user is a type of Model, so convert to object
        // and replace the invites property
        // Note: this does not update the DB
        user = user.toObject();
        user.invites = invites;
        return Q.fcall(function() {
          return user;
        });
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
  getHouseholdForUser : function(userId, email, fullName, picture, zip) {
    return User.findOne({ userId : userId})
    .then(function(user) {
      // If user exists, return the householdId
      if (user) {
        return Q.fcall(function() {
          return user.householdId;
        });
      } else {
        // If user does not exist, create a new one
        return userCtrl.createUser(userId, email, fullName, picture, zip)
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
  createUser : function(userId, email, fullName, picture, zip) {
    // Create new household for the user
    var newHousehold = new Household({});
    newHousehold.users.push(userId);
    return newHousehold.save()
    .then(function() {
      var newUser = new User({
        userId: userId,
        email: email,
        householdId: newHousehold._id,
        fullName: fullName,
        picture: picture,
        zip: zip
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
    // Generate unique inviteId to send to invitee
    var inviteId = utils.generateHash();
    return Q.fcall(email.sendInvitationEmail, inviteeEmail, inviteId)
    .then(function() {
      return Household.findById(householdId)
      .then(function(household) {
        return User.findOne({ email: inviteeEmail })
        .then(function(user) {
          if (!user) throw new Error('Cannot find user');

          user.invites.push(household._id);
          household.sentInvites.push(user.userId);

          var invite = new Invite({
            inviteId: inviteId,
            householdId: householdId,
            inviteeEmail: inviteeEmail
          });

          return household.save()
          .then(user.save)
          .then(invite.save)
          .then(function() {
            // Call getUser to get properly formatted user object
            return userCtrl.getUser(user.userId);
          });
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
        invitee.invites = invitee.invites.filter(function(id) {
          return String(id) !== householdId;
        });

        // Removes invite (and duplicates) from household's sentInvites
        household.sentInvites = household.sentInvites.filter(function(id) {
          return String(id) !== invitee.userId;
        });

        if (accept) {
          invitee.householdId = householdId;
          household.users.push(invitee.userId);
        }

        return household.save()
        .then(invitee.save)
        .then(function() {
          // Call getUser to get properly formatted user object
          return userCtrl.getUser(invitee.userId);
        });
      });
    });
  },

  /**
   *  Accepts an invitation via email
   *
   *  Looks up the required params for updateInvitation stored in
   *  the Invite Model instance relating to the inviteId before
   *  running the updateInvitation function.
   *
   *  @method updateInvitationViaEmail
   *  @param  {string}    inviteId
   *
   *  @return {Promise}   Callback is supplied with invitee's User object
   */
  updateInvitationViaEmail : function(inviteId) {
    return Invite.findOne({inviteId: inviteId})
    .then(function(invite) {
      if (!invite) throw new Error('Cannot find invite');
      return userCtrl.updateInvitation(String(invite.householdId), invite.inviteeEmail, true);
    });
  }
};
