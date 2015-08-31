var nnHelpers = require('../nn-helpers.js');
//Table with item name, expiration, initial TD for diff household sizes
//require data for diff items
//iterate over data to set up db?

appPantryData = {
  milk : require('../item-data/milkData.js'),
  rice : require('../item-data/riceData.js'),
  fruit : require('../item-data/fruitData.js'), 
  carrots : require('../item-data/carrots.js')
};

appPantry = {};

for (var item in appPantryData){
  appPantry[item] = new nnHelpers.pantryItem(item, appPantryData[item]);
}

//for now to access training data
module.exports = appPantry;
