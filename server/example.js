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

/////////////
// EXAMPLE //
/////////////

db.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});

var household1 = new Household({});


household1.save(function(){
  addToPantry('milk', household1._id);
  setTimeout(function(){addToPantry('carrots', household1._id, 6, 30);}, 200);
  setTimeout(function(){addToPantry('rice', household1._id, 6, 20);}, 400);
  setTimeout(function(){addToPantry('fruit', household1._id, 6, 20);}, 600);
});

//build list for today; note carrots get added because it's past their expiration date
setTimeout(function(){
  autoBuildList(household1._id);
  console.log('Autobuilt List');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(household.list);
    });
  },200);
  console.log(' ');
},800);

//Remove fruit if it's there
setTimeout(function(){
  removeFromList('fruit', household1._id);
  console.log('remove fruit');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log(household.list);
    });
  },200);
  console.log(' ');
},1500);

//let's say you actually DO need milk
// addToList('milk', 'household1');
// console.log('Add milk to list');
// console.log(households.household1.list);
// console.log(' ');

// //try autoBuild the next time, 
// //but milk might not show up yet--activate value is ~0.5 here
// //repeat process to add training
// autoBuildList('household1');
// console.log('Autobuilt, now with milk');
// console.log(households.household1.list);

//manually add rice to the list; rice should now be in their shopping list AND their pantry
setTimeout(function(){
  addToList('rice', household1._id);
  console.log('add rice');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Pantry',household.pantry);
      console.log('THIS LIST', household.list);
    });
  },2000);
  console.log(' ');
},2500);

//manually add cheese to the list; this should now be in pantry, but is untracked
setTimeout(function(){
  addToList('cheese', household1._id);
  console.log('Add cheese');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Pantry',household.pantry);
      console.log('THIS LIST', household.list);
    });
  },2000);
}, 3500);

//update the expiration time for the cheese
setTimeout(function(){
  updateExpTime('cheese', household1._id, 20);
  console.log('cheese in pantry');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('CHEESE',household.pantry.cheese);
    });
  },2000);
},4500);

// //turns out you don't actually want milk
// removeFromList('milk', 'household1');
// console.log('Remove milk from list');
// console.log(households.household1.list);
// console.log(' ');

// //You autoBuild again, but prior training *might* remembered.
// //This really is just an odds thing, because the trained value will be ~0.5
// autoBuildList('household1');
// console.log('Rebuild, is milk still there?');
// console.log(households.household1.list);
// console.log(' ');

// //Go shopping, checking off items as found
// // check('rice','household1');
// // console.log('Check-off rice');
// // console.log(households.household1.list);
// // console.log(' ');

//Purchase your items
setTimeout(function(){
  buy(['rice','carrots','cheese'], household1._id);
  console.log('Purchase items');
  setTimeout(function(){
    Household.findOne({ _id: household1._id }, function(err, household){
      console.log('Purchased!',household.list);
      console.log('Updated date in pantry',household.pantry);
      console.log(' ');
    });
  },2000);
  
},5500);

setTimeout(function(){
  db.close();
},9000);
// //if you autoBuild again, nothing in there!
// autoBuildList('household1');
// console.log('Autobuilt list with just fruit immedately after purchase');
// console.log(households.household1.list);
// console.log(' ');

// //But you decide you don't like fruit, so you remove it from your pantry entirely
// removeFromPantry('fruit','household1');
// console.log('No more fruit in the pantry');
// console.log(households.household1.pantry);
