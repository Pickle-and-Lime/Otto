groceries.controller('menuController', function($scope, $state) {

  $scope.goToState = function(state) {
    $state.go(state);
  };
  
});