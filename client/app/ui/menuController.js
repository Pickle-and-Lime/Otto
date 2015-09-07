groceries.controller('menuController', function($scope, $state, auth, store, $location) {
  $scope.auth = auth;
  console.log(auth.profile);
  $scope.store = store;
  $scope.logout = function(auth, store, location) {
    $scope.auth.signout();
    $scope.store.remove('profile');
    $scope.store.remove('token');
    $scope.store.remove('householdId');
    $location.path('/');
  };

  $scope.goToState = function(state) {
    $state.go(state);
  };
  
});