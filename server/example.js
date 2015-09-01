var households = require('./db/households-data.js');
var appPantry = require('./db/app-pantry.js');

var listHelpers = require('./list-helpers.js');
var addToPantry = listHelpers.addToPantry;
var autoBuildList = listHelpers.autoBuildList;
var addToList = listHelpers.addToList;
var removeFromList = listHelpers.removeFromList;
var check = listHelpers.check;
var buy = listHelpers.buy;
var removeFromPantry = listHelpers.removeFromPantry;
var updateExpTime = listHelpers.updateExpTime;
/////////////
// EXAMPLE //
/////////////
//example of adding to pantry with some fake dates (see comment above)
addToPantry('milk', 'household1', 7, 30);
addToPantry('rice', 'household1', 6, 20);
addToPantry('fruit', 'household1', 7, 23);

// console.log('household Pantry');
// console.log(households.household1.pantry);
// console.log(' ');

//build list for today; note carrots get added because it's past their expiration date
autoBuildList('household1');
console.log('Autobuilt List');
console.log(households.household1.list);
console.log(' ');

//let's say you actually DO need milk
addToList('milk', 'household1');
console.log('Add milk to list');
console.log(households.household1.list);
console.log(' ');

//try autoBuild the next time, 
//but milk might n0t show up yet--activate value is ~0.5 here
//repeat process to add training
autoBuildList('household1');
console.log('Autobuilt, now with milk');
console.log(households.household1.list);

//manually add carrots to the list; carrots should now be in their shopping list AND their pantry
addToList('carrots', 'household1');
console.log('Add carrots');
console.log('List', households.household1.list);
console.log('Pantry', households.household1.pantry);

//manually add cheese to the list; this should now be in pantry, but is untracked
addToList('cheese', 'household1');
console.log('Add cheese');
console.log('List', households.household1.list);
console.log('Pantry', households.household1.pantry);

//update the expiration time for the cheese
updateExpTime('cheese', 'household1', 20);
console.log('cheese in pantry', households.household1.pantry.cheese);

//turns out you don't actually want milk
removeFromList('milk', 'household1');
console.log('Remove milk from list');
console.log(households.household1.list);
console.log(' ');

//You autoBuild again, but prior training *might* remembered.
//This really is just an odds thing, because the trained value will be ~0.5
autoBuildList('household1');
console.log('Rebuild, is milk still there?');
console.log(households.household1.list);
console.log(' ');

//Go shopping, checking off items as found
// check('rice','household1');
// console.log('Check-off rice');
// console.log(households.household1.list);
// console.log(' ');

//Purchase your items
buy(['rice'], 'household1');
console.log('Purchase items');
console.log('Rice purchased',households.household1.list);
console.log('Updated date in pantry',households.household1.pantry);
console.log(' ');

//if you autoBuild again, nothing in there!
autoBuildList('household1');
console.log('Autobuilt list with just fruit immedately after purchase');
console.log(households.household1.list);
console.log(' ');

//But you decide you don't like fruit, so you remove it from your pantry entirely
removeFromPantry('fruit','household1');
console.log('No more fruit in the pantry');
console.log(households.household1.pantry);
