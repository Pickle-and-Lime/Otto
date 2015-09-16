var express = require('express');
var jwt = require('express-jwt');
var userController = require('../controllers/userController.js');
var router = express.Router();

// Auth0 JWT validation
var client_secret = process.env.AUTH0_CLIENT_SECRET ||
                    require('../../config/config').Auth0ClientSecret;
var jwtCheck = jwt({
  secret: new Buffer(client_secret, 'base64'),
  audience: 'Vk8WOzc8NcNXTngDQfYqEvGe00jdK92d'
});

/**
 *  GET /user/:id
 * 
 *  Retrieves information about user, including received outstanding/pending invites
 *  
 *  @return JSON
 *          { 
 *            userId:"abc", 
 *            email:"test@example.com", 
 *            householdId:"def", 
 *            invites: [ 
 *              {
 *                householdName: 'Example Name',
 *                householdId: '123abc'
 *              },
 *              {...}
 *            ]
 *          }
 */
router.get('/:id', jwtCheck, function(req, res) {
  var userId = req.params.id;
  userController.getUser(userId)
  .then(function(user) {
    res.send(user);
  })
  .catch(function() {
    res.sendStatus(404);
  });
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
router.post('/', jwtCheck, function(req, res) {
  var userId = req.body.userId;
  var email = req.body.email;
  var fullName = req.body.fullName;
  var picture = req.body.picture;
  var zip = req.body.zip;
  userController.getHouseholdForUser(userId, email, fullName, picture, zip)
  .then(function(householdId) {
    res.send(householdId);
  })
  .catch(function() {
    res.sendStatus(404);
  });
});

/**
 *  GET /user/invite/:id
 *  
 *  Accepts an invitation via email
 * 
 *  Finds an invite via ID, then accepts the invitation for that user
 *  Note: This route does not require an Auth header from Auth0
 *
 *  Redirect to root of app (to load index.html) on success
 */

router.get('/invite/:id', function(req, res) {
  var inviteId = req.params.id;
  userController.updateInvitationViaEmail(inviteId)
  .then(function() {
    res.redirect('../../');
  })
  .catch(function(err) {
    res.send(err);
  });
});

/**
 *  POST /user/invite
 *  
 *  Creates an invitation for the user
 * 
 *  Invites a user, by email, to a household specified by ID in the request
 *
 *  E.g. John (householdId = abc123) invites Kate at kate@gmail.com
 *  Receives { "household": "abc123", "inviteeEmail": "kate@gmail.com"}
 *  @return 200 if successful, 404 if unsuccessful
 */

router.post('/invite', jwtCheck, function(req, res) {
  var household = req.body.household;
  var inviteeEmail = req.body.inviteeEmail;
  userController.createInvitation(household, inviteeEmail)
  .then(function() {
    res.sendStatus(200);
  })
  .catch(function() {
    res.sendStatus(404);
  });
});

/**
 *  PUT /user/invite
 *  
 *  Updates user invitation
 *
 *  Either accepts or rejects pending invitation
 *
 *  E.g. Kate accepts John's invitation
 *  Receives { household: "abc123", inviteeEmail: "kate@gmail.com", accept: true }
 *  @return Kate's new householdId if successful, 404 if unsuccessful
 */

router.put('/invite', jwtCheck, function(req, res) {
  var household = req.body.household;
  var inviteeEmail = req.body.inviteeEmail;
  var accept = req.body.accept;
  userController.updateInvitation(household, inviteeEmail, accept)
  .then(function(user) {
    res.send(user.householdId);
  })
  .catch(function() {
    res.sendStatus(404);
  });
});

/**
 *  DELETE /user
 *
 */
router.delete('/', jwtCheck, function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
 