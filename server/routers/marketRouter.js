var express = require('express');
var router = express.Router();
var request = require('request');

/**
 *  GET /byzip/:zipcode
 *  Retrieve a list of local farmer's markets by user zip code
 */
router.get('/byzip/:zipcode', function(req, res) {
  var zipCode = req.params.zipcode;
  var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zipCode;

  request.get(url, function(error, response, body){
    if (error){
      res.status(404).send('Cannot retrieve household pantry');
    } else{
      res.send(body);
    }
  });
});

 /**
 *  GET /byid/:id
 *  Retrieve a list of local farmer's markets by id
 */
router.get('/byid/:id', function(req, res) {
  var id = req.params.id;
  var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id;

  request.get(url, function(error, response, body){
    if (error){
      res.status(404).send('Cannot retrieve household pantry');
    } else{
      res.send(body);
    }
  });
});

module.exports = router;

