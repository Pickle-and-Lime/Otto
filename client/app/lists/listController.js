groceries.controller('listController', function ($scope, $state, Lists, auth, store, States) {
  // set state to 'list' when loading this view
  States.setState('list');
  // get householdId from angular storage
  $scope.household = store.get('householdId');
  // console.log('householdId:', $scope.household);
  // function that updates shoppingList from backend
  $scope.updateList = function() {
    Lists.getList('/list/' + $scope.household)
      .then(function(res) {
        // console.log('GET /list:', res.data);
        $scope.shoppingList = res.data;
        $scope.shoppingByCategory = $scope.listConverter(res.data);
        console.log('shoppingList:', $scope.shoppingList);
        console.log('shoppingByCategory:', $scope.shoppingByCategory);
      }, function(err) {
        console.log('GET /list: ERROR', err);
      });
  };
  // function that updates masterList from backend
  $scope.updateMaster = function() { // crashes server for now
    Lists.getList('/pantry/general', $scope.household)
      .then(function(res) {
        // console.log('GET /pantry/general', res.data);
        $scope.masterList = Lists.arrayConverter(res.data);
        // console.log('masterList:', $scope.masterList);
      }, function(err) {
        console.log('GET /pantry/general ERROR', err);
      });
  };
  // update the general list and shopping list
  $scope.updateMaster();
  $scope.updateList();

  // add item from text input to shopping list on backend
  $scope.addItem = function(item) {
    if (item && item.length && !$scope.shoppingList[item]) {
      Lists.addToList('/list', item, $scope.household)
        .then(function(res) {
          console.log('POST to /list', res);
          // update shopping list after add
          $scope.userItem = '';
          $scope.updateList();
        }, function(err) {
          console.log('POST to /list ERROR', err);
        });
    }
  };
  // remove item from shopping list on backend
  $scope.removeItem = function(item) {
    Lists.removeFromList('/list/' + $scope.household + '/' + item)
      .then(function(res) {
        console.log('DELETE to /list', res.data);
        // update shopping list after add
        $scope.updateList();
      }, function(err) {
        console.log('DELETE to /list ERROR', err);
      });
  };
  // toggle checkbox in checkList
  $scope.toggleCheck = function(item) {
    $scope.shoppingList[item].checked = !$scope.shoppingList[item].checked;
    // console.log('new list:', $scope.shoppingList);
  };
  // submits checked items to backend
  $scope.checkoutList = function() {
    var items = [];
    for (var name in $scope.shoppingList) {
      if ($scope.shoppingList[name].checked) {
        items.push(name);
      }
    }
    // console.log('items to buy:', items);
    Lists.buyList(items, $scope.household)
      .then(function(res) {
        // console.log('POST /buy:', res);
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
  // convert list from backend into an array of objects grouped by category
  $scope.listConverter = function(listObj) {
    var returnArray = [];
    var newObj = {};
    for (var item in listObj) {
      var type = listObj[item].category;
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
  // add tags to current item
  $scope.addTags = function(item, newTag) {
    if (newTag && newTag.length) {
      $scope.shoppingList[item].newTag = '';
      Lists.addItemTag(item, $scope.household, newTag)
        .then(function(res) {
          console.log('addTags:', res.data);
          $scope.shoppingList = res.data.list;
        }, function(err) {
          console.log('addTags ERR:', err);
        });
    }
  };
  // active tag input starts as nothing
  $scope.activeTag = '';
  // tells whether tag input div for that item is visible
  $scope.isActiveTag = function(item) {
    return item === $scope.activeTag;
  };
  // sets the active tag div on click
  $scope.toggleActiveTag = function(item) {
    $scope.activeTag = item === $scope.activeTag ? '' : item;
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
    // helper function to add a tag to a shopping list item
    addItemTag: function(item, household, tag) {
      return $http.post('/item/tag', {item: item, household: household, tag: tag});
    },
    // helper function to post item data changes
    editItemData: function(item, household, category, expiration, purchase) {
      var time1 = (new Date(purchase)).getTime();
      var time2 = (new Date(expiration)).getTime();
      var elapsed = (time2 - time1) / 86400000;
      elapsed = elapsed > 0 ? elapsed : 1;
      var obj = {item: item, household: household, category: category, expiration: elapsed, purchase: purchase};
      console.log('POST /item/data:', obj);
      return $http.post('/item/data', obj);
    },
    

    arrayConverter: function(object) {
      var array = [];
      var item;
      for (var key in object) {
        item = {};
        item.name = key;
        item.type = object[key].category;
        item.season = object[key].season;
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
        item.category = object[key].category;
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
