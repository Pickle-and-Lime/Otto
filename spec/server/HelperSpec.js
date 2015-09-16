var redtape = require('redtape');

var mongoose = require('mongoose'),
    Household = require('../../server/db/householdModel.js');

var listController = require('../../server/controllers/listController.js');
var pantryController = require('../../server/controllers/pantryController.js');
var itemController = require('../../server/controllers/itemController.js');

var autoBuildList = listController.autoBuildList;
var addToList = listController.addToList;
var removeFromList = listController.removeFromList;
var buy = listController.buy;

var addToPantry = pantryController.addToPantry;
var removeFromPantry = pantryController.removeFromPantry;
var updateExpTime = pantryController.updateExpTime;

var getPantry =  pantryController.getPantry;
var getAppPantry = pantryController.getAppPantry;

var addTag = itemController.addTag;
var editItem = itemController.editItem;

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
    return addToPantry('Gooseberries', household1._id); // untracked without date specified
  })
  .then(function() {
    return Household.findOne({ _id: household1._id }, 'pantry', function(err, household){
      if (err) { t.error(err); }
      t.ok('Milk' in household.pantry, 'Milk added to pantry!');
      t.ok('Gooseberries' in household.pantry, 'Gooseberries added to pantry!');
      t.end();
    });
  });
});

test('addToList() should add an item from the pantry to the household\'s list and include any tags', function(t){
  addToPantry('Citrus', household1._id)
  .then(function(){
    addToList('Citrus', household1._id)
    .then(function(){
      Household.findOne({_id: household1._id}, 'list', function(err, household) {
        t.ok('Citrus' in household.list, 'Citrus in list');
        t.ok(household.list.Citrus.tags.indexOf('Lemons') !== -1, 'Tags in list');
        t.ok(household.list.Citrus.category = 'Fruit', 'Category added');
        t.end();
      });
    });
  });
});

test('addToList() should add any item to the household\'s list', function(t){
  
  addToList('Berries', household1._id)
  .then(function(){
    addToList('Chicken', household1._id)
    .then(function(){
      addToList('Guava', household1._id)
      .then(function(){
        Household.findOne({ _id: household1._id }, 'list', function(err, household) {
          t.ok('Berries' in household.list, 'Berries added to list.');
          t.ok(household.list.Berries.tags !== undefined, 'Berry tags added to list');
          t.ok('Chicken' in household.list, 'Chicken added to list.');
          t.ok(household.list.Chicken.category === 'Meat', 'Category added to chicken in list');
          t.ok('Guava' in household.list, 'Guava added to list');
          t.ok(household.list.Guava.tags === undefined, 'No tags for guava');
          t.ok(household.list.Guava.category === undefined, 'No category for guava');
          t.end();
        });
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

test('addTag() should add a tag to an item in household\'s pantry and list', function(t){
  addToList('Chicken', household1._id)
  .then(function(){
    addTag('Shredded', 'Chicken', household1._id)
    .then(function(){
      addTag('Cooked', 'Chicken', household1._id)
      .then(function(){
        Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
          t.ok(household.list.Chicken.userTags.indexOf('Shredded') !== -1, 'Tage added to userTags in list');

          t.ok(household.list.Chicken.userTags.indexOf('Cooked') !== -1, 'Tage added to userTags in list');
          t.end();
        });
      });
    });
  });
});

test('addTag() should add a tag to an item not in the appPantry in household\'s pantry and list', function(t){
  addToList('Guava', household1._id)
  .then(function(){
    addTag('Whole', 'Guava', household1._id)
    .then(function(){
      Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
        t.ok(household.list.Guava.userTags.indexOf('Whole') !== -1, 'Tage added to userTags in list');
        t.end();
      });
    });
  });
});

test('editItem() should change an item\'s category ,expiration, and purchase date in household\'s pantry', function(t){
  var timePast = 4*24*60*60*1000;
  var date = new Date();
  date.setTime(date.getTime()-timePast);
  editItem('Fruit',2, date, 'Gooseberries', household1._id)
  .then(function(){
    Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      t.ok(household.pantry.Gooseberries.expiration === 2, 'Expiration changed for item in pantry');
      t.ok(household.pantry.Gooseberries.date.getTime() === date.getTime(), 'Expiration changed for item in pantry');
      t.ok(household.pantry.Gooseberries.category === 'Fruit', 'Category changed for item in pantry');
      t.end();
    });
  });
});

test('getPantry() should return a list of the items in the pantry', function(t){
  
  getPantry(household1._id)
  .then(function(pantry){
    t.ok(pantry.Milk, 'Item listed.');
    t.ok(pantry.Gooseberries, 'Item listed.');
    t.ok(pantry.Milk, 'All pantry items listed.');

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
    Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
      t.notOk('Chicken' in household.pantry, 'Chicken removed from pantry.');
      t.end();
    });
  });
});

test('buy() should move selected items from the current list to the pantry, fullyStocking them', function(t){
  
  
  addToList('Durian', household1._id)
  .then(function(){
    buy(['Guava'], household1._id)
    .then(function(){
      Household.findOne({_id: household1._id }, 'pantry list', function(err, household){
        t.notOk('Guava' in household.list, 'Guava removed from list.');
        t.equal(household.pantry.Guava.fullyStocked, true, 'Guava in pantry.');
        t.ok(household.list.Durian, 'Durian still on list');
        t.end();
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
        t.notOk(household.pantry.Roots.fullyStocked, 'Roots not fully stocked.');

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