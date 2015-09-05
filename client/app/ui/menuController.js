groceries.controller('menuController', function($scope, $state, auth, store, $location) {
  $scope.auth = auth;
  $scope.store = store;
  $scope.logout = function(auth, store, location) {
    $scope.auth.signout();
    $scope.store.remove('profile');
    $scope.store.remove('token');
    $location.path('/');
  };

  $scope.goToState = function(state) {
    $state.go(state);
  };
  
});