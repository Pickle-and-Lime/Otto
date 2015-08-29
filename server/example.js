var listHelpers = require('./list-helpers.js');
var buildPantry = listHelpers.buildPantry;
var autoBuildList = listHelpers.autoBuildList;
var manAdd = listHelpers.manAdd;
var manRemove = listHelpers.manRemove;
var check = listHelpers.check;
var bought = listHelpers.bought;
var users = require('./db/users-data.js');
/////////////
// EXAMPLE //
/////////////
//example of adding to pantry with some fake dates (see comment above)
buildPantry('user1','milk', 7, 25);
buildPantry('user1','rice', 6, 20);
buildPantry('user1','fruit', 7, 23);
buildPantry('user1','carrots',7, 15);

console.log('User Pantry');
console.log(users.user1.pantry);
console.log(' ');

//build list for today; note carrots get added because it's past their expiration date
autoBuildList('user1');
console.log('Autobuilt List');
console.log(users.user1.list);
console.log(' ');

//let's say you actually DO need milk
manAdd('milk', 'user1');
console.log('Add milk to list');
console.log(users.user1.list);
console.log(' ');

//try autoBuild the next time, 
//but milk might n0t show up yet--activate value is ~0.5 here
//repeat process to add training
autoBuildList('user1');
console.log('Autobuilt, still no milk');
console.log(users.user1.list);

manAdd('milk', 'user1');
console.log('Add milk again');
console.log(users.user1.list);
console.log(' ');

//try the autoBuild again, and 'milk' should show up this time
autoBuildList('user1');
console.log('Updated autobuilt list WITH milk');
console.log(users.user1.list);
console.log(' ');

//turns out you don't actually want milk
manRemove('milk', 'user1');
console.log('Remove milk from list');
console.log(users.user1.list);
console.log(' ');

//You autoBuild again, but prior training *might* remembered.
//This really is just an odds thing, because the trained value will be ~0.5
autoBuildList('user1');
console.log('Rebuild, is milk still there?');
console.log(users.user1.list);
console.log(' ');

//repeat to REALLY remove milk if it is there
manRemove('milk', 'user1');
console.log('Remove milk from list');
console.log(users.user1.list);

autoBuildList('user1');
console.log('Rebuild, without milk');
console.log(users.user1.list);
console.log(' ');

//Go shopping, checking off items as found
check('rice','user1');
console.log('Check-off rice');
console.log(users.user1.list);
console.log(' ');

//Purchase your items
bought('user1');
console.log('Purchase items');
console.log('Rice purchased',users.user1.list);
console.log('Updated date in pantry',users.user1.pantry);
console.log(' ');

//if you autoBuild again, nothing in there!
autoBuildList('user1');
console.log('Autobuilt list with just fruit immedately after purchase');
console.log(users.user1.list);
