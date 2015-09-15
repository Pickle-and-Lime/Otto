var express = require('express');
var listController = require('../controllers/listController.js');
var router = express.Router();

/**
 *  GET /list/:id
 *  Returns the list generated for the requesting household
 */
router.get('/:id', function(req, res) {
  var household = req.params.id;

  listController.autoBuildList(household)
  .then(function(list) {
    res.send(list);
  })
  .catch(function(err) {
    res.status(404).send('Cannot retrieve shopping list');
  });
});

/**
 *  POST /list
 *  Manually add item to list
 */
router.post('/', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;

  listController.addToList(item, household)
  .then(function(list) {
    res.status(201).send(list);
  })
  .catch(function() {
    res.status(404).send('Cannot add item to shopping list');
  });
});

/**
 *  DELETE /list
 *  Manually remove item from list
 */
router.delete('/:id/:item', function(req, res) {
  var item = req.params.item;
  var household = req.params.id;

  listController.removeFromList(item, household)
  .then(function(list) {
    res.send(list);
  })
  .catch(function() {
    res.status(404).send('Cannot remove item from shopping list');
  });
});

module.exports = router;
