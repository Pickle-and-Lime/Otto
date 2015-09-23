var express = require('express');
var router = express.Router();
var request = require('request');

var appKey = process.env.YUMMLY_API_KEY;
var appID = process.env.YUMMLY_API_ID;

/**
 *  GET /recipes/search
 *  Retrieve a list of local farmer's markets by user zip code
 */
router.get('/:search', function(req, res) {
  var search = req.params.search;
  var url = "http://api.yummly.com/v1/api/recipes?_app_id="+appID+"&_app_key="+appKey+"&q="+search;

  request.get(url, function(error, response, body){
    var recipes = [];
    var picture;
    var time = function(time){
      var mins = time/60;
      if (mins<60){
        return mins.toString()+" min";
      } else {
        return Math.floor(mins/60).toString()+" hr " + (mins%60).toString()+" min";
      }
    };

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
    if (error){
      console.log(error);
      res.status(404).send('Cannot retrieve recipes');
    } else{
      JSON.parse(body).matches.forEach(function(match){
        if (match.smallImageUrls[0].charAt(4)===':'){
          picture = match.smallImageUrls[0].substring(0,4) + "s" + match.smallImageUrls[0].substring(4);
        }
        var length = picture.length;
        picture = picture.substring(0,length-3) + "l" + picture.substring(length-2);
        recipes.push({
          name: match.recipeName,
          time: time(match.totalTimeInSeconds),
          image: picture, //match.smallImageUrls[0],
          rating: match.rating,
          ingredients: capitalizeAll(match.ingredients)
        });
      });
      console.log(recipes);
      res.send(recipes);
    }
  });
});


module.exports = router;
