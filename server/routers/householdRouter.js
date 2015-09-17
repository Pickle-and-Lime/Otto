var express = require('express');
var householdController = require('../controllers/householdController.js');
var router = express.Router();

/**
 *  GET /household
 *  Returns the household information
 */
router.get('/:id', function(req, res) {
  var householdId = req.params.id;
  householdController.getHousehold(householdId)
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
  householdController.updateHousehold(householdId, name)
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
