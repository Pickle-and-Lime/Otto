var redtape = require('redtape');

var mongoose = require('mongoose'),
    Household = require('../../server/db/householdModel.js');

var listHelpers = require('../../server/list-helpers.js');
var addToPantry = listHelpers.addToPantry;
var autoBuildList = listHelpers.autoBuildList;
var addToList = listHelpers.addToList;
var removeFromList = listHelpers.removeFromList;
var buy = listHelpers.buy;
var removeFromPantry = listHelpers.removeFromPantry;
var updateExpTime = listHelpers.updateExpTime;
var householdHelpers = require('../../server/household-helpers.js');
var getPantry =  listHelpers.getPantry;
var getAppPantry = listHelpers.getAppPantry;


mongoose.connect('mongodb://localhost/test');
var household1 = new Household({});
household1.save();

var test = redtape({
  beforeEach: function(cb){
    cb();
  },
  afterEach: function(cb){
    cb();
  }
});

test('addToPantry() should add an item to the household\'s pantry', function(t){  
  
  setTimeout(function(){
    addToPantry('milk', household1._id, 7, 30);
  }, 3000);

  setTimeout(function(){
    Household.findOne({_id: household1._id }, 'pantry', function(err, household){
      if (err) { t.error(err); }
      t.ok("milk" in household.pantry, 'Pantry created!');
    });
  }, 5000);
  
  t.end();
});

/*test('addToList() should add any item to the household\'s list', function(t){
  setTimeout(function(){
    addToList('fruit', household1._id);
  }, 7000);

  setTimeout(function(){
    addToList('chicken', household1._id);
  }, 10000);

  setTimeout(function(){
    Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      //console.log(household);
      t.ok('fruit' in household.list, 'Fruit added to list.');
      t.ok('chicken' in household.list, 'Chicken added to list.');
    });
  }, 18000);

  t.end();
});

test('removeFromList() should remove the passed in item from the household\'s list', function(t){
  setTimeout(function(){
    removeFromList('fruit', household1._id);
  }, 15000);

  setTimeout(function(){
    removeFromList('chicken', household1._id);
  }, 18000);

  setTimeout(function(){
    Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      
      t.notOk('fruit' in household.list, 'Fruit removed from list.');
      t.notOk('chicken' in household.list, 'Chicken removed from list.');
    });
  }, 23000);

  t.end();
});

test('getPantry() should return a list of the items in the pantry', function(t){
  
  setTimeout(function(){
    var pantry = getPantry(household1._id);
    console.log('This is what getPantry delivers: ', pantry);
    t.ok(pantry.milk, 'Item listed.');
    t.ok(pantry.fruit, 'Item listed.');
    t.ok(pantry.chicken, 'All pantry items listed.');
  }, 18000);

  t.end();
});
*/
test('getAppPantry() should retrieve the names of items in the app pantry', function(t){
  
  setTimeout(function(){
    var appPantry = getAppPantry();

    t.ok(appPantry.milk, 'App pantry list retrieved.');
  }, 8000);

  t.end();
});
/*
test('removeFromPantry should remove items from the pantry', function(t){
  
  setTimeout(function(){
    removeFromPantry('chicken', household1._id);
  }, 23000);

  setTimeout(function(){
    Household.findOne({_id: household1._id }, 'pantry', function(err, household){
      t.notOk('chicken' in household.pantry, 'Chicken removed from pantry.');
      
    });
  }, 25000);

  t.end();
});

test('buy() should move selected items from the current list to the pantry, fullyStocking them', function(t){
  
  setTimeout(function(){
    addToList('pie', household1._id);
  }, 27000);

  setTimeout(function(){
    addToList('ice_cream', household1._id);
  }, 30000);

  setTimeout(function(){
    buy(['ice_cream'], household1._id);
  }, 33000);

  setTimeout(function(){
    Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      
      t.notOk('ice_cream' in household.list, 'Ice cream removed from list.');
      t.equal(household.pantry['ice_cream'].fullyStocked, true, 'Ice cream in pantry.');
      t.ok(household.list.pie, 'Pie still on list');
    });
  }, 35000);

  t.end();
});

/*test('autoBuildList should add expired items automatically', function(t){
  setTimeout(function(){addToPantry('carrots', household1._id, 7, 15);}, 200);
  autoBuildList(household1._id);
});*/

/*test('', function(t){t.end();});*/

/*test('', function(t){t.end();});*/

/*test('', function(t){t.end();});*/
setTimeout(function(){
  Household.findOneAndRemove();
  mongoose.connection.db.dropCollection('households', function(err, result){
    if(err){ console.error(err); }
    mongoose.connection.close();
  });
}, 7000);