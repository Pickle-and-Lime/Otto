var express = require('express');
var router = express.Router();

/**
 *  GET /household
 *  Returns the household information
 */
router.get('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  POST /household
 *  Add email to household?
 */
router.post('/', function(req, res) {
  res.sendStatus(200);
});

/**
 *  DELETE /household
 *
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
