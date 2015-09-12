var express = require('express');
var Q = require('q');
var listController = require('../controllers/listController.js');
var router = express.Router();

/**
 *  POST /buy
 *  Purchase list of items from shopping cart
 */
router.post('/', function(req, res) {
  var items = req.body.items;
  var household = req.body.household;
  console.log('items:',items,'household:',household);
  listController.buy(items, household)
  .then(function() {
    res.sendStatus(201);
  })
  .catch(function() {
    res.status(404).send('Cannot update purchased items');
  });
});

module.exports = router;
