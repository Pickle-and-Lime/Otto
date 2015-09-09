var redtape = require('redtape');

var mongoose = require('mongoose'),
    Household = require('../../server/db/householdModel.js');

var listHelpers = require('../../server/list-helpers.js');
var pantryHelpers = require('../../server/pantry-helpers.js');

var autoBuildList = listHelpers.autoBuildList;
var addToList = listHelpers.addToList;
var removeFromList = listHelpers.removeFromList;
var buy = listHelpers.buy;

var addToPantry = pantryHelpers.addToPantry;
var removeFromPantry = pantryHelpers.removeFromPantry;
var updateExpTime = pantryHelpers.updateExpTime;

var getPantry =  pantryHelpers.getPantry;
var getAppPantry = pantryHelpers.getAppPantry;


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
  addToPantry('Milk', household1._id, 7, 30) // tracked with date specified
  .then(function() {
    return addToPantry('Rice', household1._id); // untracked without date specified
  })
  .then(function() {
    return Household.findOne({ _id: household1._id }, 'pantry', function(err, household){
      if (err) { t.error(err); }
      t.ok('Milk' in household.pantry, 'Milk added to pantry!');
      t.ok('Rice' in household.pantry, 'Rice added to created!');
      t.end();
    });
  });
});

test('addToList() should add any item to the household\'s list', function(t){
  
  addToList('Berries', household1._id)
  .then(function(){
    addToList('Chicken', household1._id)
    .then(function(){
      Household.findOne({ _id: household1._id }, 'list', function(err, household) {
        t.ok('Berries' in household.list, 'Berries added to list.');
        t.ok('Chicken' in household.list, 'Chicken added to list.');
        t.end();
      });
    });
  });
});

test('removeFromList() should remove the passed in item from the household\'s list', function(t){
  
  removeFromList('Berries', household1._id)
  .then(function(){
    removeFromList('Chicken', household1._id)
    .then(function(){
      Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
        t.notOk('Berries' in household.list, 'Berries removed from list.');
        t.notOk('Chicken' in household.list, 'Chicken removed from list.');
        t.end();
      });
    });
  });
});

test('getPantry() should return a list of the items in the pantry', function(t){
  
  getPantry(household1._id)
  .then(function(pantry){
    t.ok(pantry.Milk, 'Item listed.');
    t.ok(pantry.Berries, 'Item listed.');
    t.ok(pantry.Chicken, 'All pantry items listed.');

    t.end(); 
  });
  
});

test('getAppPantry() should retrieve the names of items in the app pantry', function(t){  
  
  getAppPantry()
  .then(function(appPantry){
    t.ok(appPantry.Milk, 'App pantry list retrieved.');

    t.end();
  });

});

test('removeFromPantry() should remove items from the pantry', function(t){
  
  removeFromPantry('Chicken', household1._id)
  .then(function(){
    Household.findOne({_id: household1._id }, 'pantry', function(err, household){
      t.notOk('Chicken' in household.pantry, 'Chicken removed from pantry.');
      t.end();
    });
  });
});

test('buy() should move selected items from the current list to the pantry, fullyStocking them', function(t){
  
  
  addToList('Durian', household1._id)
  .then(function(){
    addToList('Dessert', household1._id)
    .then(function(){
      buy(['Dessert'], household1._id)
      .then(function(){
        Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
          t.notOk('Dessert' in household.list, 'Dessert removed from list.');
          t.equal(household.pantry.Dessert.fullyStocked, true, 'Dessert in pantry.');
          t.ok(household.list.Durian, 'Durian still on list');
          t.end();
        });  
      });
    });
  });
});

test('autoBuildList() should add items that the user needs', function(t){
  addToPantry('Roots', household1._id, 7, 15)
  .then(function(){
    autoBuildList(household1._id)
    .then(function(){
      Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      //Test for presence in pantry and fullyStocked = false 
        t.ok('Roots' in household.pantry, 'Roots added to pantry.');
        t.ok('Roots' in household.list, 'Roots added to list');
        t.notOk(household.pantry['Roots'].fullyStocked, 'Roots not fully stocked.');

        //Clear and close db connection
        Household.findOneAndRemove();
        mongoose.connection.db.dropCollection('households', function(err, result){
          if(err){ console.error(err); }
          mongoose.connection.close();
        });
        t.end();
      });
    });
  });
});