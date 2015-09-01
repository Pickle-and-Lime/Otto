groceries.controller('listController', function($scope, $state, Lists) {

  $scope.goToState = function(state) {
    $state.go(state);
  };
  // scope variables for type ahead input
  $scope.selected = false;
  $scope.pantrySelected = false;

  $scope.userItem = '';
  $scope.userPantryItem = '';

  // fired when an item from typeahead list is clicked
  $scope.selectTypeAhead = function(item) {
    $scope.userItem = item;
    // $scope.selected = true;
  };

  $scope.selectPantryTypeAhead = function(item) {
    $scope.userPantryItem = item;
  };

  // fired when Add Item button is clicked
  // need to change logic as far as adding new items to the master list
  $scope.enterItem = function(){
    // only do something if userItem is bound to something
    if ($scope.userItem.length) { 
      // push to shopping list if not already in there
      if ($scope.shoppingList.indexOf($scope.userItem) === -1) {
        $scope.shoppingList.push($scope.userItem);
      }
      // reset userItem and selected boolean
      $scope.userItem = '';
      $scope.selected = false;
    }
  };

  $scope.enterPantryItem = function(){
    if ($scope.userPantryItem.length) { 
      if ($scope.pantryList.indexOf($scope.userPantryItem) === -1) {
        $scope.pantryList.push($scope.userPantryItem);
      }
      $scope.userPantryItem = '';
      $scope.pantrySelected = false;
    }
  };

  // check if item from pantryBuilder is in shoppingList or pantryList
  $scope.inList = function(index) { // index refers to pantryBuilder
    var item = $scope.pantryBuilder[index];
    return $scope.shoppingList.indexOf(item) !== -1;
  };

  $scope.inPantry = function(index) {
    var item = $scope.pantryBuilder[index];
    return $scope.pantryList.indexOf(item) !== -1;
  };

/* -------------------------------------------------------------------------- */

  $scope.winter = ['Apples','Bananas','Beets','Brussels Sprouts','Cabbage'];
  $scope.spring = ['Apples','Apricots','Asparagus','Bananas','Broccoli'];
  $scope.summer = ['Apples','Apricots','Bananas','Beets','Bell Peppers'];
  $scope.fall = ['Apples','Bananas','Beets','Bell Peppers','Broccoli'];

  $scope.todaysMarket = {
    "Name": "West Sacramento Farmers Market",
    "Address":"1271 West Capitol Ave., West Sacramento, California, 95691",
    "GoogleLink":"http:\/\/maps.google.com\/?q=38.581499%2C%20-121.523316%20(%22West+Sacramento+Farmers+Market%22)",
    "Products":"Baked goods; Cheese and\/or dairy products; Cut flowers; Eggs; Fresh fruit and vegetables; Fresh and\/or dried herbs; Honey; Canned or preserved fruits, vegetables, jams, jellies, preserves, salsas, pickles, dried fruit, etc.; Meat; Poultry; Prepared foods (for immediate consumption); Wine, beer, hard cider",
    "Schedule":"05\/29\/2014 to 09\/25\/2014 Thu: 4:30 PM-8:00 PM"
  };

  $scope.suggestions = Lists.suggestions;
  $scope.masterList = Lists.masterList;
  $scope.shoppingList = Lists.shoppingList;
  $scope.pantryList = Lists.pantryList;
  $scope.pantryBuilder = Lists.pantryBuilder;

  $scope.addSuggestion = function(index) {
    Lists.moveToList($scope.suggestions, $scope.shoppingList, index);
  };

  $scope.removeSuggestion = function(index) {
    Lists.removeFromList($scope.suggestions, index);
  };

  $scope.addToShoppingList = function(item) { // manually add item to shoppingList
    Lists.addToList(item, $scope.shoppingList);
  };

  $scope.removeListItem = function(index) {
    Lists.removeFromList($scope.shoppingList, index);
  };

  $scope.buyListItem = function(index) { // move from shoppingList to pantryList
    Lists.moveToList($scope.shoppingList, $scope.pantryList, index);
  };

  $scope.removeFromPantryBuilder = function(index) { // remove from pantryBuilder
    Lists.removeFromList($scope.pantryBuilder, index);
  };
  
  $scope.needFromPantryBuilder = function(item) { // add from pantryBuilder to shoppingList
    // Lists.moveToList($scope.pantryBuilder, $scope.shoppingList, index);
    Lists.addToList(item, $scope.shoppingList);
  };

  $scope.haveFromPantryBuilder = function(item) { // add from pantryBuilder to pantryList
    // Lists.moveToList($scope.pantryBuilder, $scope.pantryList, index);
    Lists.addToList(item, $scope.pantryList);
  };
    
  $scope.addToPantryList = function(item) { // manually add item to pantryList
    Lists.addToList(item, $scope.pantryList);
  };

  $scope.removeFromPantryList = function(index) { // move from pantryList to suggestions
    Lists.moveToList($scope.pantryList, $scope.suggestions, index);
  };
  
});

groceries.factory('Lists', function() {
  // var suggestions = [ // suggestions for items based on predicted needs
  //   'Eggs',
  //   'Bread',
  //   'Milk',
  //   'Cheese',
  //   'Kale',
  //   'Tofu',
  //   'Eggplant',
  //   'Lettuce',
  //   'Onions',
  //   'Cereal',
  //   'Rice',
  //   'Chicken',
  //   'Shrimp'
  // ];

  var suggestions = [];

  var masterList = [ // master list of all possible items
    'Asparagus',
    'Broccoli',
    'Cabbage',
    'Carrots',
    'Cauliflower',
    'Celery',
    'Corn',
    'Garlic',
    'Lettuce',
    'Mushrooms',
    'Onions',
    'Peppers',
    'Potato',
    'Squash',
    'Sweet Potato',
    'Tomatoes',
    'Zucchini',
  ];

  var shoppingList = []; // current shopping list

  var pantryList = []; // current pantry list

  var pantryBuilder = masterList.slice(); // list to display in pantry builder

  return {
    suggestions: suggestions,

    masterList: masterList,

    shoppingList: shoppingList,

    pantryList: pantryList,

    pantryBuilder: pantryBuilder,

    // helper function to move item at index from origin array to destination array
    moveToList: function(origin, destination, index) {
       var item = origin.splice(index, 1)[0];
       if (destination.indexOf(item) === -1) { // push to destination if item doesn't exist already
         destination.push(item);
       }
    },

    // helper function move item at index from list
    removeFromList: function(list, index) {
      list.splice(index, 1);
    },

    // adds a new item to any number of lists that are optional arguments
    addToList: function(item) {
      for (var i = 1; i < arguments.length; i++) {
        if (arguments[i].indexOf(item) === -1) {
          arguments[i].push(item);
        }
      }
    }

  };
});