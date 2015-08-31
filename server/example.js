var listHelpers = require('./list-helpers.js');
var appPantry = require('./db/app-pantry.js');
var buildPantry = listHelpers.buildPantry;
var autoBuildList = listHelpers.autoBuildList;
var manAdd = listHelpers.manAdd;
var manRemove = listHelpers.manRemove;
var check = listHelpers.check;
var bought = listHelpers.bought;
var households = require('./db/households-data.js');
/////////////
// EXAMPLE //
/////////////
//example of adding to pantry with some fake dates (see comment above)
buildPantry('household1','milk', 7, 30);
buildPantry('household1','rice', 6, 20);
buildPantry('household1','fruit', 7, 23);
buildPantry('household1','carrots',7, 15);

// console.log('household Pantry');
// console.log(households.household1.pantry);
// console.log(' ');

//build list for today; note carrots get added because it's past their expiration date
autoBuildList('household1');
console.log('Autobuilt List');
console.log(households.household1.list);
console.log(' ');

//let's say you actually DO need milk
manAdd('milk', 'household1');
console.log('Add milk to list');
console.log(households.household1.list);
console.log(' ');

//try autoBuild the next time, 
//but milk might n0t show up yet--activate value is ~0.5 here
//repeat process to add training
autoBuildList('household1');
console.log('Autobuilt, now with milk');
console.log(households.household1.list);

//turns out you don't actually want milk
manRemove('milk', 'household1');
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
check('rice','household1');
console.log('Check-off rice');
console.log(households.household1.list);
console.log(' ');

//Purchase your items
bought('household1');
console.log('Purchase items');
console.log('Rice purchased',households.household1.list);
console.log('Updated date in pantry',households.household1.pantry);
console.log(' ');

//if you autoBuild again, nothing in there!
autoBuildList('household1');
console.log('Autobuilt list with just fruit immedately after purchase');
console.log(households.household1.list);
