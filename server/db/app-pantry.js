var PantryItem = require('../nn-helpers.js');
var appPantry = require('./appPantryModel.js');
var db = require('../db.js');

appPantryData = {
  milk : require('../item-data/milkData.js'),
  rice : require('../item-data/riceData.js'),
  fruit : require('../item-data/fruitData.js'), 
  carrots : require('../item-data/carrots.js')
};

var pantryMilk = new PantryItem('milk', appPantryData['milk']);

//How to add to the pantry db instead?
for (var item in appPantryData){
  var testPantry =  new appPantry({
    name: item,
    data: new PantryItem(item, appPantryData[item])
  });
  testPantry.save();
}

//db.close();

//for now to access the pantry items
//module.exports = testPantry;
