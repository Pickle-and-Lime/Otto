/*This file reads a text file containing all of the item data for our pantry and converts it into an object:
var pantry = {
  Roots: {
    category: Vegetables,
    tags: [carrots, parsnips, rutabaga, radishes], --> will also pull these out so they are individually in the pantry
    expiration: 30, --> in days
    trainingSet: [{input: 1, output:...}], 
    seasons: [] --> a list of each month the item is in season, counting from Jan = 0 (because that's what JS does)
  }
}
*/
var fs = require('fs');
var trainingSets = {
  Weekly: [{input: [1], output: [0.1]}, {input: [7], output: [0.9]}], 
  Biweekly: [{input: [1], output: [0.1]}, {input: [14], output: [0.9]}], 
  Monthly: [{input: [1], output: [0.1]}, {input: [30], output: [0.9]}], 
  Infrequently: [{input: [1], output: [0.1]}, {input: [90], output: [0.9]}],
  Rarely: [{input: [1], output: [0.1]}, {input: [180], output: [0.9]}], 
};

var data = {};
var categoriesObj = {};
fs.readFileSync("buildGenPantry.txt").toString().split('\n').forEach(function (line) {
    var item = line.split(";");
    var name = item[0];
    data[name] = {};

    data[name].category = item[1].trim();
    categoriesObj[data[name].category] = true;

    data[name].tags = item[2].trim().split(',');
    if (data[name].tags[0].length === 0){
      data[name].tags = [];
    } else{
      for (var i = 0; i < data[name].tags.length; i++) {
        data[name].tags[i] = data[name].tags[i].trim();
      }
    }

    data[name].expiration = Number(item[3].trim());
    data[name].trainingSet = trainingSets[item[4].trim()];
    
    data[name].season = item[5].trim().split(',');

    if (data[name].season[0]===""){
      data[name].season = [];
    } else {
      for (var j = 0; j < data[name].season.length; j++) {
        data[name].season[j] = Number(data[name].season[j]);
      }
    }
});
var categories = [];
for (var category in categoriesObj){
  categories.push(category);
}
fs.writeFile("finalPantry.js", 
  "var pantry = " + JSON.stringify(data) +
  ";\nvar categories = " + JSON.stringify(categories)+ 
  ";\nmodule.exports = {pantry: pantry, categories: categories};", 
  function(err){
  if (!err){
    console.log("done!");
  }
});