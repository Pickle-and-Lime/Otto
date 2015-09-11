var express = require('express');
var Q = require('q');
var itemHelpers = require('../item-helpers.js');
var router = express.Router();

/**
 *  POST /tag
 *  Manually add tags to item
 */
router.post('/tag', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var tag = req.body.tag;

  itemHelpers.addTag(tag, item, household)
  .then(function(list) {
    res.status(201).send(list);
  })
  .catch(function() {
    res.status(404).send('Cannot add tag');
  });
});

/**
 *  POST /expiration
 *  Manually add expiration data to item
 */
router.post('/expiration', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var expiration = req.body.expiration;

  itemHelpers.editExpiration(expiration, item, household)
  .then(function(pantry) {
    res.status(201).send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add expiration');
  });
});

/**
 *  POST /purchased
 *  Manually add last purchased date to item
 */
router.post('/purchased', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var purchased = req.body.purchased;

  itemHelpers.editPurchaseDate(purchased, item, household)
  .then(function(pantry) {
    res.status(201).send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add purchased');
  });
});

module.exports = router;