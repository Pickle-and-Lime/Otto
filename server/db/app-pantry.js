var nnHelpers = require('../nn-helpers.js');

appPantryData = {
  milk : require('../item-data/milkData.js'),
  rice : require('../item-data/riceData.js'),
  fruit : require('../item-data/fruitData.js'), 
  carrots : require('../item-data/carrots.js')
};

appPantry = {};

//How to add to the pantry db instead?
for (var item in appPantryData){
  appPantry[item] = new nnHelpers.pantryItem(item, appPantryData[item]);
}

//for now to access the pantry items
module.exports = appPantry;
