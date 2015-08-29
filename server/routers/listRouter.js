var express = require('express');
var router = express.Router();

/**
 *  GET /list
 *  Returns the list generated for the requesting household
 *  This will call autoBuildList or grab the already generated list
 *  from the DB
 */
router.get('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  POST /list
 *  Manually add item to list
 *  If NN for item exists, call manAdd?
 *  If not, call newItem?
 */
router.post('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  DELETE /list
 *  Manually remove item from list
 *  This will call manRemove if item was added by Rosie
 *  If not, it will simply remove it from the list (not affecting NN)
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
