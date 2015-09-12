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
 *  POST /dates
 *  Manually edit expiration and purchase dates of item
 */
router.post('/dates', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var expiration = req.body.expiration;
  var purchase = req.body.purchase;

  itemHelpers.editItem(expiration, date, item, household)
  .then(function(pantry) {
    res.status(201).send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add expiration');
  });
});

module.exports = router;