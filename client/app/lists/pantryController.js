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
  // $scope.inPantry = function(item) {
  //   // console.log('firing inPantry');
  //   if ($scope.pantryList === undefined) { // if somehow pantryList hasn't been populated yet
  //     return false; 
  //   } else {
  //     return !!$scope.pantryList[item];
  //   }
  // };
  // // check whether an item from pantryBuilder is in the shopping list
  // $scope.inList = function(item) {
  //   // console.log('firing inPantry');
  //   if ($scope.shoppingList === undefined) { // if somehow shoppingList hasn't been populated yet
  //     return false; 
  //   } else {
  //     return !!$scope.shoppingList[item];
  //   }
  // };
  // check whether the item has been added into either shopping list or pantry list
  $scope.isAdded = function(item) {
    if (!$scope.shoppingList && !$scope.pantryList) { // if neither list is loaded
      return false;
    } else if (!!$scope.shoppingList && !$scope.pantryList) { // shoppingList loaded but not pantryList
      return !!$scope.shoppingList[item];
    } else if (!$scope.shoppingList && !!$scope.pantryList) { // pantryList loaded but not shoppingList
      return !!$scope.pantryList[item];
    } else { // both lists loaded
      return !!$scope.shoppingList[item] || !!$scope.pantryList[item];
    }
  };
  // check whether pantry or shopping list is still loading
  $scope.loadingPantry = function() {
    return !$scope.pantryList || !$scope.shoppingList;
  };

  // function that updates pantryList from backend
  $scope.updatePantry = function() {
    Lists.getList('/pantry/household/' + $scope.household)
      .then(function(res) {
        // console.log('GET /pantry', res.data);
        $scope.pantryList = res.data;
        $scope.pantryByCategory = $scope.pantryConverter(res.data);
        // console.log('pantryByCategory:', $scope.pantryByCategory);
        console.log('pantryList:', $scope.pantryList);
      }, function(err) {
        console.log('GET /pantry ERR', err);
      });
  };
  // function that updates shoppingList from backend
  $scope.updateList = function() {
    Lists.getList('/list/' + $scope.household)
      .then(function(res) {
        console.log('shoppingList:', res.data);
        $scope.shoppingList = res.data;
      }, function(err) {
        console.log('GET /list: ERROR', err);
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
  $scope.updateList();
  $scope.updatePantry();
  $scope.getCategories();
  // this adds a pantry item to the list
  $scope.addItem = function(item) {
    if (item && item.length && !$scope.pantryList[item]) {
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
  // these variables and functions handle pantry item deletion confirmation
  $scope.toDelete = '';

  $scope.isDelete = function(item) {
    return item === $scope.toDelete;
  };

  $scope.toggleDelete = function(item) {
    $scope.toDelete = $scope.toDelete === item ? '' : item;
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
  // these variables and functions handle pantry item editing
  $scope.activeItem = '';
  $scope.editedDate = (new Date()).toDateString();
  $scope.editedCategory = 'Alcohol';
  $scope.editedExpiration = (new Date()).toDateString();
  $scope.editVisible = false;
  $scope.editingCategory = false;

  $scope.toggleEditCategory = function() {
    $scope.editingCategory = !$scope.editingCategory;
  };

  $scope.setCategory = function(item) {
    $scope.editedCategory = item;
    $scope.toggleEditCategory();
  };

  $scope.toggleActive = function(item) {
    $scope.activeItem = item;
    console.log($scope.pantryList[item]);
    $scope.editedCategory = $scope.pantryList[item].category || $scope.editedCategory;
    $scope.editedDate = (new Date($scope.pantryList[item].date)).toDateString() || $scope.editedDate;
    var expMils = $scope.pantryList[item].expiration*24*60*60*1000;
    var expDateMils = new Date($scope.pantryList[item].date).getTime()+expMils;
    $scope.editedExpiration = (new Date(expDateMils)).toDateString() || $scope.editedExpiration;
    if (!$scope.editVisible){
      $scope.editVisible = !$scope.editVisible;
    }
  };

  $scope.cancelEdits = function(){
    $scope.editVisible = !$scope.editVisible;
  };

  $scope.submitItemEdits = function() {
    if ($scope.activeItem.length && $scope.household && $scope.editedCategory && $scope.editedExpiration && $scope.editedDate) { // submit only if all args exist
      // console.log('Date Formats:', $scope.editedDate, $scope.editedExpiration);
      Lists.editItemData($scope.activeItem, $scope.household, $scope.editedCategory, $scope.editedExpiration, $scope.editedDate)
        .then(function(res) {
          $scope.editVisible = !$scope.editVisible;
          console.log('SUBMIT:', res.data);
          $scope.updatePantry();
        }, function(err) {
          console.log('SUBMIT:', err);
        });
    }
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
        // update shopping list on completion
        $scope.updateList();
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

  // Make shortened date string for an item to display in pantry
  $scope.makeDate = function(item) {
    var date = new Date($scope.pantryList[item].date);
    return date.toDateString();
  };

  // make date using the current active item for editing
  $scope.makeActiveDate = function() {
    $scope.makeDate($scope.activeItem);
  };

  // Make expiration date based on original purchase date and expiration number from item
  $scope.makeExpiration = function(item) {
    var oldDate = (new Date($scope.pantryList[item].date)).valueOf();
    var elapsed = $scope.pantryList[item].expiration * 24 * 60 * 60 * 1000;
    var newTime = oldDate + elapsed;
    return (new Date(newTime)).toDateString();
  };
});