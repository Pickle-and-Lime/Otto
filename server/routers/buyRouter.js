var express = require('express');
var Q = require('q');
var listHelpers = require('../list-helpers');
var router = express.Router();

/**
 *  POST /buy
 *  Purchase list of items from shopping cart
 */
router.post('/', function(req, res) {
  var items = res.body.items;
  var household = res.body.household;

  Q.fcall(listHelpers.buy, items, household)
  .then(function() {
    res.sendStatus(201);
  })
  .catch(function() {
    res.status(404).send('Cannot update purchased items');
  })
});

module.exports = router;
