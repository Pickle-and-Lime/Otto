var express = require('express');
var Q = require('q');
var userHelpers = require('../user-helpers');
var router = express.Router();

/**
 *  GET /user/:id
 * 
 *  Todo: retrieve information about user, including outstanding invites
 */
router.get('/:id', function(req, res) {
  res.sendStatus(200);
});

/**
 *  POST /user
 *  
 *  If User exists, return householdId
 *  If User doesn't exist, create new User and new Household
    and return householdId
 *
 *  Receives { "userId": "123abc", "email": "example@site.com"}
 *  Returns String householdId
 */
router.post('/', function(req, res) {
  var userId = req.body.userId;
  var email = req.body.email;
  userHelpers.getHouseholdForUser(userId, email)
  .then(function(householdId) {
    res.send(householdId);
  })
  .catch(function() {
    res.status(404);
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
