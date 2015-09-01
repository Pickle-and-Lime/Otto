var express = require('express');
var Q = require('q');
var listHelpers = require('../list-helpers');
var router = express.Router();

/**
 *  GET /pantry
 *  Returns the pantry for the household
 *  Includes two lists: tracked and untracked
 */
router.get('/', function(req, res) {
  // TODO: DB call to retrieve household pantry items
  res.sendStatus(200);
});

/**
 *  GET /pantry/general
 *  Returns the general pantry (all items)
 */
router.get('/general', function(req, res) {
  // TODO: DB call to retrieve all pantry items
  res.sendStatus(200);
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
