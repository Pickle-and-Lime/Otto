var express = require('express');
var router = express.Router();

/**
 *  GET /pantry
 *  Returns the pantry for the household
 */
router.get('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  POST /pantry
 *  Add item to pantry by calling bought?
 *  Remove item from list if it is present
 *  
 */
router.post('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  DELETE /pantry
 *  Remove item from pantry
 *  This will need to update NN, as user 
 *  now does not have the product?
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
