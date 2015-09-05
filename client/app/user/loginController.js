groceries.controller('loginController', ['$scope', '$http', 'auth', 'store', '$location',
  function ($scope, $http, auth, store, $location) {
    
    $scope.auth = auth;
    $scope.login = function () {
      auth.signin({}, function (profile, token) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        $location.path('/landing');
      }, function (err) {
        // Error callback
        console.log('Error in loginController: ', err);
      });
    };

    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $location.path('/');
    };
  }
]);