var express = require('express');
var itemController = require('../controllers/itemController.js');
var router = express.Router();

/**
 *  POST /tag
 *  Manually add tags to item
 */
router.post('/tag', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var tag = req.body.tag;

  itemController.addTag(tag, item, household)
  .then(function(list) {
    res.status(201).send(list);
  })
  .catch(function() {
    res.status(404).send('Cannot add tag');
  });
});

/**
 *  POST /data
 *  Manually edit expiration and purchase dates of item
 */
router.post('/data', function(req, res) {
  var item = req.body.item;
  var household = req.body.household;
  var category = req.body.category;
  var expiration = req.body.expiration;
  var purchase = req.body.purchase;

  itemController.editItem(category, expiration, date, item, household)
  .then(function(pantry) {
    res.status(201).send(pantry);
  })
  .catch(function() {
    res.status(404).send('Cannot add expiration');
  });
});

module.exports = router;