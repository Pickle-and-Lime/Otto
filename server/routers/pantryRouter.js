var express = require('express');
var pantryController = require('../controllers/pantryController.js');
var router = express.Router();

/**
 *  GET /pantry/household/:id
 *  Returns the pantry for the household
 *  Includes two lists: tracked and untracked
 */
router.get('/household/:id', function(req, res) {
  var household = req.params.id;

  pantryController.getPantry(household)
  .then(function(pantry) {
    res.send(pantry);
  })
  .catch(function(err) {
    res.status(404).send('Cannot retrieve household pantry');
  });
});

/**
 *  GET /pantry/general
 *  Returns the general pantry (all items)
 */
router.get('/general', function(req, res) {
  pantryController.getAppPantry()
  .then(function(appPantry) {
    res.send(appPantry);
  })
  .catch(function() {
    res.status(404).send('Cannot retrieve general pantry');
  });
});

router.get('/categories', function(req, res) {
  pantryController.getItemCategories()
  .then(function(categories) {
    res.send(categories);
  })
  .catch(function() {
    res.status(404).send('Cannot retrieve general pantry');
  });
});

/**
 *  POST /pantry
 *  Add item to pantry from pantry builder
 *  Note: For items bought, use /buy
 */
router.post('/', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;

  pantryController.addToPantry(item, household)
  .then(function(pantry) {
    res.status(201).send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add item to pantry');
  });
});

/**
 *  DELETE /pantry
 *  Remove item from pantry
 *  Note: This will not add the item to shopping list
 */
router.delete('/:id/:item', function(req, res) {
  var item = req.params.item;
  var household = req.params.id;
  pantryController.removeFromPantry(item, household)
  .then(function(pantry) {
    res.send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add item to pantry');
  });
});

module.exports = router;