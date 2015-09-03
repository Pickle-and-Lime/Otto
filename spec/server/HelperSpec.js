var redtape = require('redtape');

var mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
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

//Wrap mongoose in mockgoose to intercept calls to connection

var db = mongoose.connection;

var test = redtape({
  beforeEach: function(cb){
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/orbit');
    cb();
  },
  afterEach: function(cb){
    mockgoose.reset();
    mongoose.connection.close();
    cb();
  }
});

test('addToPantry should add an item to the household\'s pantry', function(t){
 
  var household1 = new Household({});

  addToPantry('milk', household1._id, 7, 30);
  
  setTimeout(function(){
    household1.save(function(err, product){
      if(err){
        t.error(err);
      }
    });
  }, 2000);

  setTimeout(function(){
    t.ok(household1.pantry, 'Pantry created!');
  }, 4000); 
  
  t.end();
});

