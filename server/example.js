var db = require('./db.js');
var Q = require('q');

var Household = require('./db/householdModel.js');


var listHelpers = require('./list-helpers.js');
var addToPantry = listHelpers.addToPantry;
var autoBuildList = listHelpers.autoBuildList;
var addToList = listHelpers.addToList;
var removeFromList = listHelpers.removeFromList;
var buy = listHelpers.buy;
var removeFromPantry = listHelpers.removeFromPantry;
var updateExpTime = listHelpers.updateExpTime;
var householdHelpers = require('./household-helpers.js');

/////////////
// EXAMPLE //
/////////////

db.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});

var household1 = new Household({});

household1.save(function(){
  addToPantry('milk', household1._id, 7, 30);
  setTimeout(function(){addToPantry('carrots', household1._id, 7, 15);}, 200);
  setTimeout(function(){addToPantry('fruit', household1._id, 7, 30);}, 600);
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

//Remove fruit
setTimeout(function(){
  removeFromList('fruit', household1._id);
  console.log('remove fruit');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(2, household.list);
      console.log(' ');
    });
  },200);
},1200);

//Autobuild without fruit
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, no more fruit!');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(3,household.list);
      console.log(' ');
    });
  },200);
},1600);

//let's say you actually DO need milk
setTimeout(function(){
  addToList('milk', household1._id);
  console.log('Add milk to list');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(4, household.list);
      console.log(' ');
    });
  },2000); 
}, 2000);

//try autoBuild the next time, 
//but milk might not show up yet--activate value is ~0.5 here
//repeat process to add training
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, with milk?');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(5,household.list);
      console.log(' ');
    });
  },600);
},4800);


//manually add rice to the list; rice should now be in their shopping list AND their pantry
setTimeout(function(){
  addToList('rice', household1._id);
  console.log('add rice');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(6, household.list);
      console.log(' ');
    });
  },2000);
},5800);

//manually add cheese to the list; this should now be in pantry, but is untracked
setTimeout(function(){
  addToList('cheese', household1._id);
  console.log('Add cheese');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(7, household.list);
    });
  },2000);
}, 8000);

//update the expiration time for the cheese
setTimeout(function(){
  updateExpTime('cheese', household1._id, 20);
  console.log('cheese in pantry');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('CHEESE',household.pantry.cheese);
    });
  },2000);
},10500);

//turns out you don't actually want milk
setTimeout(function(){
  removeFromList('milk', household1._id);
  console.log('Remove milk');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(8, household.list);
      console.log(' ');
    });
  },2000); 
}, 13000);
//You autoBuild again, but prior training *might* remembered.
//This really is just an odds thing, because the trained value will be ~0.5
//notice rice is not there because you rebuilt the list, and rice had today's date
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List, with milk?');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(9,household.list);
      console.log(' ');
    });
  },2000);
},15500);

//Purchase your items
setTimeout(function(){
  buy(['carrots'], household1._id);
  console.log('Purchase items');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Purchased!',household.list);
      console.log('Updated date in pantry',household.pantry.carrots.date);
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

// //But you decide you don't like fruit, so you remove it from your pantry entirely
setTimeout(function(){
  removeFromPantry('fruit',household1._id);
 console.log('No more fruit in the pantry');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('No fruit here!',household.pantry);
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