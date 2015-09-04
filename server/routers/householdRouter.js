var express = require('express');
var Q = require('q');
var householdHelpers = require('../household-helpers');
var router = express.Router();

/**
 *  GET /household
 *  Returns the household information
 *  Note: right now, only returning the household id
 */
router.get('/', function(req, res) {
  Q.fcall(householdHelpers.getHousehold)
  .then(function(household) {
    //res.send({householdId: household[0]._id});

    //below: test responses simulating an already existing household and a household that doesn't exist yet.
    //res.send({householdId: household[0]._id, name: 'King House', members: ['aking123@yahoo.com', 'amk_awesome@hotmail.com', 'paws@thedog.com']});
    res.send({});
  })
  .catch(function() {
    res.status(404);
  })
});

/**
 *  POST /household
 *  Add email to household?
 */
router.post('/', function(req, res) {
  res.status(201).send({success: 'YEs'});
});

/**
 *  DELETE /household
 *
 */
router.delete('/', function(req, res) {
  res.sendStatus(200);
});

module.exports = router;
