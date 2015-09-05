groceries.controller('pantryController', function($scope, Lists) {

    // scope variable for household id grabbed from backend - might want to put in named function eventually
  Lists.getList('/household')
    .then(function(res) {
      console.log('GET /household:', res.data);
      $scope.household = res.data.householdId;
      console.log('householdId:',$scope.household);
      // call update functions to populate lists
      $scope.updateMaster();
      $scope.updatePantry();
    }, function(err) {
      console.log('GET /household ERR:', err);
    });

  // function that updates pantryList from backend
  $scope.updatePantry = function() {
    Lists.getList('/pantry/household/' + $scope.household)
      .then(function(res) {
        console.log('GET /pantry', res);
        $scope.pantryList = res.data;
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
      }, function(err) {
        console.log('GET /pantry/general', err);
      });
  };
  // this adds a pantry item to the list
  $scope.addItem = function(item) {
    Lists.addToList('/pantry', item, $scope.household)
      .then(function(res) {
        console.log('POST /pantry:', res.data);
        // update pantry list on completion
        $scope.updatePantry();
      }, function(err) {
        console.log('POST /pantry:', err);
      });
  };
  // this removes a pantry item from the list
  $scope.removeItem = function(item) {
    Lists.removeFromList('/pantry', item, $scope.household)
      .then(function(res) {
        console.log('DELETE /pantry:', res.data);
        // update pantry list on completion
        $scope.updatePantry();
      }, function(err) {
        console.log('DELETE /pantry:', err);
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
  // set the userPantryItem when a typeahead item is clicked
  $scope.setItem = function(item) {
    $scope.userPantryItem = item;
  };
});