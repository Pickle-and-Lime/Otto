groceries.controller('pantryController', function ($scope, Lists, auth, store) {
  // get householdId from angular storage
  $scope.household = store.get('householdId');
  console.log('householdId:', $scope.household);
  // eventually get them from backend
  $scope.categories = [
    "Alcohol","Baked Goods","Beverages","Breakfast","Canned Foods","Condiments And Sauces",
    "Dairy","Deli","Fats And Oils","Fresh Herbs","Frozen","Fruits","Grains And Grain Products",
    "Legumes","Meat","Pet Food","Pets","Preserves And Butters","Ready-Made Dough","Seafood",
    "Spices And Baking","Staples And Miscellaneous","Vegetables"
  ];
  // allows us to show and hide sections using ng-show
  $scope.visibleCategory = '';

  $scope.setVisible = function(category) {
    if ($scope.checkVisible(category)) {
      $scope.visibleCategory = '';
    } else {
      $scope.visibleCategory = category;
    }
  };

  $scope.checkVisible = function(category) {
    return $scope.visibleCategory === category;
  };
  // check whether an item from pantryBuilder is in the pantry
  $scope.inPantry = function(item) {
    // console.log('firing inPantry');
    if ($scope.pantryList === undefined) { // if somehow pantryList hasn't been populated yet
      return false; 
    } else {
      for (var i = 0; i < $scope.pantryList.length; i++) {
        if ($scope.pantryList[i].name === item) {
          return true;
        }
      }
      return false;
    }
  };
  // check whether pantry list is still loading
  $scope.loadingPantry = function() {
    return !$scope.pantryList;
  };

  // function that updates pantryList from backend
  $scope.updatePantry = function() {
    Lists.getList('/pantry/household/' + $scope.household)
      .then(function(res) {
        console.log('GET /pantry', res.data);
        $scope.pantryList = Lists.pantryMaker(res.data);
        console.log('pantryList:', $scope.pantryList);
      }, function(err) {
        console.log('GET /pantry ERR', err);
      });
  };

  // function that updates masterList from backend
  $scope.updateMaster = function() {
    Lists.getList('/pantry/general', $scope.household)
      .then(function(res) {
        console.log('GET /pantry/general', res.data);
        $scope.masterList = Lists.arrayConverter(res.data);
        console.log('MasterList:',$scope.masterList);
      }, function(err) {
        console.log('GET /pantry/general', err);
      });
  };
  // update general list and pantry list
  $scope.updateMaster();
  $scope.updatePantry();
  // this adds a pantry item to the list
  $scope.addItem = function(item) {
    Lists.addToList('/pantry', item, $scope.household)
      .then(function(res) {
        console.log('POST /pantry:', res.data);
        // update pantry list on completion
        $scope.userPantryItem = '';
        $scope.updatePantry();
      }, function(err) {
        console.log('POST /pantry:', err);
      });
  };
  // this removes a pantry item from the list
  $scope.removeItem = function(item) {
    Lists.removeFromList('/pantry/' + $scope.household + '/' + item)
      .then(function(res) {
        console.log('DELETE /pantry:', res.data);
        // update pantry list on completion
        $scope.updatePantry();
      }, function(err) {
        console.log('ERROR DELETE /pantry:', err);
      });
  };
  // ranOut will send a request to add the item to the shopping list, and update the pantry
  $scope.ranOut = function(item) {
    if (item && item.length) { // only add if there is something in userItem string
      Lists.addToList('/list', item, $scope.household)
        .then(function(res) {
          console.log('ranOut POST to /list', res.data);
          // update pantry list after add
          $scope.updatePantry();
        }, function(err) {
          console.log('ranOut POST to /list ERROR', err);
        });
    }
  };
  // needItem sends an item from the pantryBuilder to the shopping list
  $scope.needItem = function(item) {
    Lists.addToList('/list', item, $scope.household)
      .then(function(res) {
        console.log('POST /list:', res.data);
        // update pantry list on completion
        $scope.updatePantry();
      }, function(err) {
        console.log('POST /list:', err);
      });
  };
  // set the userPantryItem when a typeahead item is clicked
  $scope.setItem = function(item) {
    $scope.userPantryItem = item;
  };
});