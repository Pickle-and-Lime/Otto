
groceries.controller('listController', function($scope, $state, Lists, auth) {

  // scope variable for household id grabbed from backend - might want to put in named function eventually
  Lists.getList('/household')
    .then(function(res) {
      console.log('GET /household:', res.data);
      $scope.household = res.data.householdId;
      console.log('householdId:',$scope.household);
      // call update functions to populate lists
      $scope.updateMaster();
      $scope.updateList();
    }, function(err) {
      console.log('GET /household ERR:', err);
    });

  // function that updates shoppingList from backend
  $scope.updateList = function() {
    Lists.getList('/list/' + $scope.household)
      .then(function(res) {
        console.log('GET /list:', res.data);
        $scope.shoppingList = Lists.listMaker(res.data);
        console.log('shoppingList:', $scope.shoppingList);
      }, function(err) {
        console.log('GET /list: ERROR', err);
      });
  };
  // function that updates masterList from backend
  $scope.updateMaster = function() { // crashes server for now
    Lists.getList('/pantry/general', $scope.household)
      .then(function(res) {
        console.log('GET /pantry/general', res.data);
        $scope.masterList = Lists.arrayConverter(res.data);
        // console.log('masterList:', $scope.masterList);
      }, function(err) {
        console.log('GET /pantry/general ERROR', err);
      });
  };


  // add item from text input to shopping list on backend
  $scope.addItem = function(item) {
    if (item && item.length) { // only add if there is something in userItem string
      Lists.addToList('/list', item, $scope.household)
        .then(function(res) {
          console.log('POST to /list', res);
          // update shopping list after add
          $scope.updateList();
        }, function(err) {
          console.log('POST to /list ERROR', err);
        });
    }
  };
  // remove item from shopping list on backend
  $scope.removeItem = function(item) {
    console.log('removeItem firing with:', item);
    Lists.removeFromList('/list/' + $scope.household + '/' + item)
      .then(function(res) {
        console.log('DELETE to /list', res.data);
        // update shopping list after add
        $scope.updateList();
      }, function(err) {
        console.log('DELETE to /list ERROR', err);
      });
  };
  // takes shopping list and formats an object to be used with checkbox form
  // $scope.makeListObj = function() {
  //   var result = {};
  //   for (var key in $scope.shoppingList) {
  //     result[key] = false;
  //   }
  //   return result;
  // };
  // toggle checkbox in checkList
  $scope.toggleCheck = function(item) {
    // $scope.shoppingList[item].checked = !$scope.shoppingList[item].checked;
    for (var i = 0; i < $scope.shoppingList.length; i++) {
      if ($scope.shoppingList[i].name === item) {
        $scope.shoppingList[i].checked = !$scope.shoppingList[i].checked;
        return;
      }
    }
  };
  // submits checked items to backend
  $scope.checkoutList = function() {
    var items = [];
    console.log('shoppingList:', $scope.shoppingList);
    for (var i = 0; i < $scope.shoppingList.length; i++) {
      if ($scope.shoppingList[i].checked) {
        items.push($scope.shoppingList[i].name);
      }
    }
    console.log('items to buy:', items);
    Lists.buyList(items, $scope.household)
      .then(function(res) {
        console.log('POST /buy:', res);
        // re-create the shopping list object
        $scope.updateList();
      }, function(err) {
        console.log('POST /buy: ERROR', err);
        $scope.updateList();
      });
  };

  $scope.setItem = function(item) {
    $scope.userItem = item;
  };
  
});

groceries.factory('Lists', function($http) {
  return {
    // general helper for getting list from backend
    getList: function(path, household) {
      return $http.get(path, {data: {household: household}}); // params might be an object with 'household1'
    }, 
    // general helper for adding item to a list on the backend
    addToList: function(path, item, household) { // unknown if household needs to be input for now
      return $http.post(path, {item: item, household: household});
    },
    // general helper to remove an item from a list on the backend
    removeFromList: function(path, item, household) { // unknown if household needs to be input for now
      return $http.delete(path, {data: {item: item, household: household}});
    },
    // helper function to buy a list of items
    buyList: function(itemsArray, household) {
      return $http.post('/buy', {items: itemsArray, household: household});
    },

    arrayConverter: function(object) {
      var array = [];
      var item;
      for (var key in object) {
        item = {};
        item.name = key;
        item.type = object[key].category;
        array.push(item);
      }
      return array;
    },

    listMaker: function(object) {
      var array = [];
      var item;
      for (var key in object) {
        item = {};
        item.name = key;
        item.checked = object[key].checked;
        array.push(item);
      }
      return array;
    },

    pantryMaker: function(object) {
      var array = [];
      var item;
      for (var key in object) {
        item = {};
        item.name = key;
        item.type = object[key].category;
        item.fullyStocked = object[key].fullyStocked;
        array.push(item);
      }
      return array;
    }

  };
});
