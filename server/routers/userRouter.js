var express = require('express');
var Q = require('q');
var userHelpers = require('../user-helpers');
var router = express.Router();

/**
 *  GET /user/:id
 * 
 *  Retrieves information about user, including outstanding invites
 *  
 *  @return JSON
 *          { 
 *            userId:"abc", 
 *            email:"test@example.com", 
 *            householdId:"def", 
 *            invites: ['bob@gmail.com', 'karen@gmail.com']
 *          }
 */
router.get('/:id', function(req, res) {
  var userId = req.params.id;
  userHelpers.getUser(userId)
  .then(function(user) {
    res.send(user);
  })
  .catch(function() {
    res.sendStatus(404);
  })
});

/**
 *  POST /user
 *  
 *  If User exists, return householdId
 *  If User doesn't exist, create new User and new Household
    and return householdId
 *
 *  Receives { "userId": "123abc", "email": "example@site.com"}
 *  @return String householdId
 */
router.post('/', function(req, res) {
  var userId = req.body.userId;
  var email = req.body.email;
  userHelpers.getHouseholdForUser(userId, email)
  .then(function(householdId) {
    res.send(householdId);
  })
  .catch(function() {
    res.sendStatus(404);
  })
});

/**
 *  POST /user/invite
 *  
 *  Creates an invitation for the user
 * 
 *  Invites a user, by email, to another user's household
 *
 *  E.g. John at john@gmail.com invites Kate at kate@gmail.com
 *  Receives { "creatorEmail": "john@gmail.com", "inviteeEmail": "kate@gmail.com"}
 *  @return 200 if successful, 404 if unsuccessful
 */

router.post('/invite', function(req, res) {
  var creatorEmail = req.body.creatorEmail;
  var inviteeEmail = req.body.inviteeEmail;
  userHelpers.createInvitation(creatorEmail, inviteeEmail)
  .then(function() {
    res.sendStatus(200);
  })
  .catch(function() {
    res.sendStatus(404);
  })
});

/**
 *  PUT /user/invite
 *  
 *  Updates user invitation
 *
 *  Either accepts or rejects pending invitation
 *
 *  E.g. Kate accepts John's invitation
 *  Receives { creatorEmail: "john@gmail.com", inviteeEmail: "kate@gmail.com", accept: true }
 *  @return Kate's new householdId if successful, 404 if unsuccessful
 */

router.put('/invite', function(req, res) {
  var creatorEmail = req.body.creatorEmail;
  var inviteeEmail = req.body.inviteeEmail;
  var accept = req.body.accept;
  userHelpers.updateInvitation(creatorEmail, inviteeEmail, accept)
  .then(function(user) {
    res.send(user.householdId);
  })
  .catch(function() {
    res.sendStatus(404);
  })
});


/**
 *  DELETE /user
 *
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
 