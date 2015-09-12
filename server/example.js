var db = require('./db.js');
var Q = require('q');

var Household = require('./db/householdModel.js');

var pantryController = require('./controllers/pantryController.js');

var listController = require('./controllers/listController.js');
var addToPantry = pantryController.addToPantry;
var autoBuildList = listController.autoBuildList;
var addToList = listController.addToList;
var removeFromList = listController.removeFromList;
var buy = listController.buy;
var removeFromPantry = pantryController.removeFromPantry;
var updateExpTime = pantryController.updateExpTime;
var householdHelpers = require('./household-helpers.js');

/////////////
// EXAMPLE //
/////////////

db.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});

var household1 = new Household({});

household1.save(function(){
  addToPantry('Milk', household1._id, 8, 4);
  setTimeout(function(){addToPantry('Beer', household1._id, 7, 20);}, 200);
  setTimeout(function(){addToPantry('Apples', household1._id, 7, 15);}, 600);

});

//build list for today; note carrots get added because it's past their expiration date
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(1, household.list);
      console.log(' ');
    });
  },200);
},800);

//Remove Apples
setTimeout(function(){
  removeFromList('Apples', household1._id);
  console.log('remove Apples');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(2, household.list);
      console.log(' ');
    });
  },200);
},1200);

//Autobuild without Apples
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, no more Apples!');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(3,household.list);
      console.log(' ');
    });
  },200);
},1600);

//let's say you actually DO need Milk
setTimeout(function(){
  addToList('Milk', household1._id);
  console.log('Add Milk to list');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(4, household.list);
      console.log(' ');
    });
  },2000); 
}, 2000);

//try autoBuild the next time, 
//but Milk might not show up yet--activate value is ~0.5 here
//repeat process to add training
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, with Milk?');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(5,household.list);
      console.log(' ');
    });
  },600);
},4800);


//manually add Rice to the list; Rice should now be in their shopping list AND their pantry
setTimeout(function(){
  addToList('Rice', household1._id);
  console.log('add Rice');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(6, household.list);
      console.log(' ');
    });
  },2000);
},5800);

//manually add Tumeric to the list; this should now be in pantry, but is untracked
setTimeout(function(){
  addToList('Tumeric', household1._id);
  console.log('Add Tumeric');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(7, household.list);
    });
  },2000);
}, 8000);

//update the expiration time for the Tumeric
setTimeout(function(){
  updateExpTime('Tumeric', household1._id, 20);
  console.log('Tumeric in pantry');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Tumeric',household.pantry.Tumeric);
    });
  },2000);
},10500);

//turns out you don't actually want Milk
setTimeout(function(){
  removeFromList('Milk', household1._id);
  console.log('Remove Milk');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(8, household.list);
      console.log(' ');
    });
  },2000); 
}, 13000);
//You autoBuild again, but prior training *might* remembered.
//This really is just an odds thing, because the trained value will be ~0.5
//notice Rice is not there because you rebuilt the list, and Rice had today's date
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, with Milk?');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(9,household.list);
      console.log(' ');
    });
  },2000);
},15500);

//Purchase your items
setTimeout(function(){
  buy(['Beer'], household1._id);
  console.log('Purchase items');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Purchased!',household.list);
      console.log('Updated date in pantry',household.pantry.Beer.date);
      console.log(' ');
    });
  },2000);
  
},18000);


// // //if you autoBuild again, nothing in there!
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List after');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(10,household.list);
      console.log(' ');
    });
  },2000);
},20500);

// //But you decide you don't like Apples, so you remove it from your pantry entirely
setTimeout(function(){
  removeFromPantry('Apples',household1._id);
 console.log('No more Apples in the pantry');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('No Apples here!',household.pantry);
      console.log(' ');
    });
  },2000);
},23500);

setTimeout(function(){
  Household.remove({ _id : household1._id }, function(err) {
    if (err) console.error(err);
    db.close();
  });
},26000);