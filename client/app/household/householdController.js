groceries.controller('householdController', function($scope) {
  //holds user inputs
  $scope.inputs = {householdName: "", householdSize: null, emails: []};

  //holds current inputs without saving to the input object
  $scope.currentEmail = "";
  $scope.currentHouseholdName = "";
  $scope.currentHouseholdSize = null;

  //dynamic class variable for create household button, set to "" to enable button
  $scope.createButtonActive = "disabled";
  $scope.addEmailActive = "disabled";
  $scope.editHover = "hidden";

  //inserts email into array when user submits
  $scope.submitEmail = function(){
    if ($scope.currentEmail !== ""){
      $scope.inputs.emails.push($scope.currentEmail);
      $scope.currentEmail = "";
      $scope.checkInputs();
    }
  };

  //checks if all inputs entered and activates 'create' button
  //emailForm is used to check if valid email has been entered, if so it enables add button
  $scope.checkInputs = function(emailForm){
    emailForm = emailForm || false;
    var i = $scope.inputs;

    //check if email is valid, if so enable add button, else disable it
    if (emailForm.$valid){
      $scope.addEmailActive = "";
    }
    else {
      $scope.addEmailActive = "disabled";
    }

    //check all inputs for validity, if valid enable create button, else disable
    if (i.householdName !== ""       && 
        i.householdName.length <= 24 &&
        i.householdSize >= 1         && 
        i.householdSize % 1 === 0    && 
        i.emails.length >= 1) {
      $scope.createButtonActive = "";
    }
    else {
      $scope.createButtonActive = "disabled";
    }
  };

  //inserts the clicked email into the edit form, deletes it from the input object
  $scope.editEmail = function(email, index){
    $scope.currentEmail = email;
    $scope.inputs.emails.splice(index, 1);

    //forces focus back to email input
    angular.element('#emailx').trigger('focus');
    $scope.checkInputs();

    //forces add button active, should be valid email, will update on text change anyways.
    $scope.addEmailActive = "";
  };

  $scope.createHousehold = function(){
    console.log('Created!!')
  };
});







