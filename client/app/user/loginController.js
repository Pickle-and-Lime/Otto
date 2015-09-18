/**
 * Login Controller: Controlls login.html, account.html, zip.html
 * @module Login Controller
 */
groceries.controller('loginController', ['$scope', '$http', 'auth', 'store', '$location', 'States',
  /**
  * Anonymous login controller function
  * @class loginController
  */
  function ($scope, $http, auth, store, $location, States) {
    /**
     * function to initialize scope variables, check authentication status
     * @method init
     */
    var init = function(){
      // set state to 'login' when loading this view
      States.setState('login');
      $scope.zipSubmitEnabled = "disabled";
      $scope.zipSubmitted = false; 
      $scope.auth = auth;
    };
    init();

    /**
     * function to check for valid zip code
     * @method checkZip
     */
    $scope.checkZip = function(){
      if (/\d{5}/.test($scope.zip)){
        $scope.zipSubmitEnabled = "";
      }
      else $scope.zipSubmitEnabled = "disabled";
    };

    
    /**
     * function to log a user in (calls Auth0 function auth.signin())
     * @method login
     */
    $scope.login = function () {
      auth.signin({}, function (profile, token) {
        // Success callback
        store.set('token', token);
        store.set('profile', profile);
        getUser();
      }, function (err) {
        // Error callback
        console.log('Error in loginController: ', err);
      });
    };

    /**
     * function to sign a user up (calls Auth0 funciton auth.signup())
     * @method signup
     */
    $scope.signup = function () {
      auth.signup({}, function (profile, token) {
        // Success callback
        store.set('token', token);
        store.set('profile', profile);
        getUser();
      }, function (err) {
        // Error callback
        console.log('Error in loginController: ', err);
      });
    };

    /**
     * function log a user out (calls Auth0 auth.signout()) and clear set angular-storage variables
     * @method logout
     */
    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      store.remove('householdId');
      $location.path('/');
    };

    /**
     * function to send user information to server to be stored in db, set angular-stoarge vars, redirect to /landing
     * @method updateUser
     */
    $scope.updateUser = function(){
      $scope.zipSubmitted = true;
      $http.post('/api/user', {userId: $scope.auth.profile.user_id.split('|')[1],
                           fullName: $scope.auth.profile.name,
                           email: $scope.auth.profile.email,
                           picture: $scope.auth.profile.picture,
                           zip: $scope.zip })
      .then(function(res){
        $scope.auth.profile.household = {householdId: res.data};
        store.set('householdId', res.data);
        store.set('zip', $scope.zip);
        $location.path('/landing');
      },
        function (err){
          Materialize.toast('Ooops, check your connection and try again.', 10000);
          console.log(err);
        }
      );
    };

    /**
     * function to get user information from server (after Auth0 signin)
     * @method getUser
     */
    var getUser = function(){
      $http.get('/api/user/' + $scope.auth.profile.user_id.split('|')[1])
      .then(function(res){
        if (res.data.zip){
          $scope.zip = res.data.zip;
          $scope.updateUser();
        }
        else $location.path('/zip');
      }, function(err){
        $location.path('/zip');
      });
    };

  }
]);