var express = require('express');
var Q = require('q');
var householdHelpers = require('../household-helpers');
var router = express.Router();

/**
 *  GET /household
 *  Returns the household information
 *  Note: right now, only returning the household id
 */
router.get('/', function(req, res) {
  householdHelpers.getHousehold()
  .then(function(householdId) {
    res.send({householdId: householdId});
  })
  .catch(function() {
    res.status(404);
  });
});

/**
 *  POST /household
 *  Add email to household?
 */
router.post('/', function(req, res) {
  res.status(201).send({success: 'YEs'});
});

/**
 *  DELETE /household
 *
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
