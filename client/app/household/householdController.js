groceries.controller('householdController', ['$scope', '$http', '$location', 'auth', 
  function ($scope, $http, $location, auth) {
    $scope.auth = auth;

  //initialize object to hold all scope elements, avoids child scope issues with ng-if statements
    $scope.s = {};
    //initialize household as null
    $scope.s.household = null;
    
    //function to request household from server
    var getHousehold = function(){
      $scope.s.callFinished = false;
      $http.get('/household')
        .then(function(res){
          $scope.s.household = res.data;
          if ($scope.s.household.householdId){
            $location.path( "/household" );
          }
          $scope.s.callFinished = true;
        }, function(err){
          console.log('ERROR in householdController getHousehold()', err);
          //$scope.s.submitted = false;
          Materialize.toast('Ooops, check your connection and try again.', 10000);
      });
    };
    getHousehold();

    //holds user inputs
    $scope.s.inputs = {householdName: "", householdSize: null, emails: []};

    //holds current inputs without saving to the input object
    $scope.s.currentEmail = "";

    //dynamic class variables for create household button, set to "" to enable button
    $scope.s.createButtonActive = "disabled";
    $scope.s.addEmailActive = "disabled";

    //used to toggle the create button/loading icon when form submitted, also toggles forms enabled/disabled
    $scope.s.submitted = false;

    //inserts email into array when user submits
    $scope.s.submitEmail = function(){
      if ($scope.s.currentEmail !== ""){
        $scope.s.inputs.emails.push($scope.s.currentEmail);
        $scope.s.currentEmail = "";
        $scope.s.checkInputs();
      }
    };

    //checks if all inputs entered and activates 'create' button
    //emailForm is used to check if valid email has been entered, if so it enables add button
    $scope.s.checkInputs = function(emailForm){
      emailForm = emailForm || false;
      var i = $scope.s.inputs;

      //check if email is valid, if so enable add button, else disable it
      if (emailForm.$valid){
        $scope.s.addEmailActive = "";
      }
      else {
        $scope.s.addEmailActive = "disabled";
      }

      //check all inputs for validity, if valid enable create button, else disable
      if (i.householdName !== ""       && 
          i.householdName.length <= 24 &&
          i.householdSize >= 1         && 
          i.householdSize % 1 === 0    && 
          i.emails.length >= 1) {
        $scope.s.createButtonActive = "";
      }
      else {
        $scope.s.createButtonActive = "disabled";
      }
    };

    //inserts the clicked email into the edit form, deletes it from the input object
    $scope.s.editEmail = function(email, index){
      if (!$scope.s.submitted){
        $scope.s.currentEmail = email;
        $scope.s.inputs.emails.splice(index, 1);

        //forces focus back to email input
        angular.element('#emailx').trigger('focus');
        $scope.s.checkInputs();

        //forces add button active, should be valid email, will update on text change anyways.
        $scope.s.addEmailActive = "";
      }
    };

    //submits the household data to server, then redirects to household page
    $scope.s.createHousehold = function(){
      if ($scope.s.createButtonActive !== "disabled"){
        $scope.s.submitted = true;
        sendHousehold();
      }
    };

    var sendHousehold = function(){
      $http.post('/household', $scope.s.inputs)
        .then(function(res){
          $location.path( "/household" );
        }, function(err){
          console.log('ERROR in householdController sendHousehold()', err);
          $scope.s.submitted = false;
          Materialize.toast('Ooops, check your connection and try again.', 10000);
      });
    };
    $scope.s.test=function(){
      console.log($scope.s.currentEmail);
      if ($scope.currentEmail !== ""){
        console.log('test');
      }
    };
  }
]);
