var express = require('express');
var Q = require('q');
var listHelpers = require('../list-helpers');
var router = express.Router();

/**
 *  GET /pantry/household/:id
 *  Returns the pantry for the household
 *  Includes two lists: tracked and untracked
 */
router.get('/household/:id', function(req, res) {
  var household = req.params.id;

  Q.fcall(listHelpers.getPantry, household)
  .then(function(household) {
    res.send(household[0].pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot retrieve household pantry');
  })
});

/**
 *  GET /pantry/general
 *  Returns the general pantry (all items)
 */
router.get('/general', function(req, res) {
  Q.fcall(listHelpers.getAppPantry)
  .then(function(appPantry) {
    res.send(appPantry);
  })
  .catch(function() {
    res.status(404).send('Cannot retrieve general pantry');
  })
});


/**
 *  POST /pantry
 *  Add item to pantry from pantry builder
 *  Note: For items bought, use /buy
 */
router.post('/', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;

  Q.fcall(listHelpers.addToPantry, item, household)
  .then(function() {
    res.sendStatus(201);
  })
  .catch(function() {
    res.status(404).send('Cannot add item to pantry');
  })
});

/**
 *  DELETE /pantry
 *  Remove item from pantry
 *  Note: This will not add the item to shopping list
 */
router.delete('/', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;

  Q.fcall(listHelpers.removeFromPantry, item, household)
  .then(function() {
    res.sendStatus(200);
  })
  .catch(function() {
    res.status(404).send('Cannot add item to pantry');
  })
});

module.exports = router;