var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var Q = require('q');

var keys = require('../../config/config.js');
var appKey = keys.yummlyAppKey;
var appID =keys.yummlyAppID;

var capitalize = function(string){
  var capitalized = [];
  string.split(' ').forEach(function(word){
    capitalized.push(word.charAt(0).toUpperCase() + word.slice(1));
  });
  return capitalized.join(' ');
};
var capitalizeAll = function(array){
  return array.map(capitalize);
};
var time = function(time){
  var mins = time/60;
  if (mins<60){
    return mins.toString()+" min";
  } else {
    return Math.floor(mins/60).toString()+" hr " + (mins%60).toString()+" min";
  }
};

var getInfo = function(recipes, results){
  recipes.forEach(function(recipe){
    results.push({
      name: recipe.recipeName,
      time: time(recipe.totalTimeInSeconds),
      rating: recipe.rating,
      ingredients: capitalizeAll(recipe.ingredients),
      idUrl : 'http://api.yummly.com/v1/api/recipe/'+recipe.id+'?_app_id='+appID+'&_app_key='+appKey
    });
  });
  return results;  
};

/**
 *  GET /recipes/search
 *  Retrieve a list of local farmer's markets by user zip code
 */
router.get('/:search', function(req, res) {
  var search = req.params.search;
  var url = "http://api.yummly.com/v1/api/recipes?_app_id="+appID+"&_app_key="+appKey+"&q="+search;
  var recipes = [];

  rp.get(url)
  .then(function(body){
    var data = JSON.parse(body);
    Q.fcall(getInfo, data.matches, recipes)
    .then(function(results){
      return recipes.reduce(function(curr, next){
        return curr.then(function(){
          return rp.get(next.idUrl)
          .then(function(body){
            image = JSON.parse(body).images[0].hostedLargeUrl;
            if (image.charAt(4)===':'){
              image = image.substring(0,4) + "s" + image.substring(4);
            }
            next.picture = image;
          });
        });
      }, Q())
      .then(function(){
        res.send(recipes);
      });
    })
  .catch(function() {
    res.status(404).send('Cannot find recipes');
  });
    
  });
});


module.exports = router;