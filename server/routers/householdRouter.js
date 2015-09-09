var express = require('express');
var Q = require('q');
var householdHelpers = require('../household-helpers');
var router = express.Router();

/**
 *  GET /household
 *  Returns the household information
 */
router.get('/:id', function(req, res) {
  var householdId = req.params.id;
  householdHelpers.getHousehold(householdId)
  .then(function(household) {
    res.send(household);
  })
  .catch(function() {
    res.status(404);
  });
});

/**
 *  PUT /household
 *  Update information for household
 *  For now, only updating Name property
 */
router.put('/', function(req, res) {
  var householdId = req.body.household;
  var name = req.body.name;
  householdHelpers.updateHousehold(householdId, name)
  .then(function(household) {
    res.send(household);
  })
  .catch(function() {
    res.status(404);
  });
});

/**
 *  DELETE /household
 *
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
