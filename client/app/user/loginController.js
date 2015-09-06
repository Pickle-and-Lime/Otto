groceries.controller('loginController', ['$scope', '$http', 'auth', 'store', '$location',
  function ($scope, $http, auth, store, $location) {
    
    $scope.auth = auth;
    $scope.login = function () {
      auth.signin({}, function (profile, token) {
        // Success callback
        updateUser();
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

    var updateUser = function(){
      $http.post('/user', {userId: $scope.auth.profile.user_id.split('|')[1], 
                           email: $scope.auth.profile.email})
      .then(function(res){
        $scope.auth.profile.household = {householdId: res.data};
      },
        function(err){
          console.log(err);
        }
      );
    };
  }
]);