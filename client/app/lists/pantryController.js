groceries.controller('pantryController', function ($scope, Lists, auth, store, States) {
  // set state to 'pantry' when loading this view
  States.setState('pantry');
  // get householdId from angular storage
  $scope.household = store.get('householdId');
  console.log('householdId:', $scope.household);
  // get list of categories from backend
  $scope.getCategories = function() { // crashes server for now
    Lists.getList('/pantry/categories', $scope.household)
      .then(function(res) {
        // console.log('GET /pantry/categories', res.data);
        $scope.categories = res.data;
        console.log('categories:', $scope.categories);
      }, function(err) {
        console.log('GET /pantry/categories ERROR', err);
      });
  };
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
      for (var key in $scope.pantryList) {
        if (key === item) {
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
        // console.log('GET /pantry', res.data);
        $scope.pantryList = res.data;
        $scope.pantryByCategory = $scope.pantryConverter(res.data);
        console.log('pantryByCategory:', $scope.pantryByCategory);
        console.log('pantryList:', $scope.pantryList);
      }, function(err) {
        console.log('GET /pantry ERR', err);
      });
  };

  // function that updates masterList from backend
  $scope.updateMaster = function() {
    Lists.getList('/pantry/general', $scope.household)
      .then(function(res) {
        // console.log('GET /pantry/general', res.data);
        $scope.masterList = Lists.arrayConverter(res.data);
        // console.log('MasterList:',$scope.masterList);
      }, function(err) {
        console.log('GET /pantry/general', err);
      });
  };
  // update general list and pantry list and category list
  $scope.updateMaster();
  $scope.updatePantry();
  $scope.getCategories();
  // this adds a pantry item to the list
  $scope.addItem = function(item) {
    if (item && item.length) { // only add if there is something in userItem string
      Lists.addToList('/pantry', item, $scope.household)
        .then(function(res) {
          console.log('POST /pantry:', res.data);
          // update pantry list on completion
          $scope.userPantryItem = '';
          $scope.updatePantry();
        }, function(err) {
          console.log('POST /pantry:', err);
        });
    }
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
  // convert pantry from backend into an array of objects grouped by category
  $scope.pantryConverter = function(pantryObj) {
    var returnArray = [];
    var newObj = {};
    for (var item in pantryObj) {
      var type = pantryObj[item].category;
      newObj[type] = newObj[type] || [];
      newObj[type].push(item);
    }
    for (var category in newObj) {
      var obj = {};
      obj.type = category;
      obj.items = newObj[category];
      returnArray.push(obj);
    }
    return returnArray;
  };
  // check if a particular item is fullyStocked
  $scope.isStocked = function(item) {
    return $scope.pantryList[item].fullyStocked;
  };
});