/**
 * Household Controller: Controlls household.html and createHousehold.html
 * @module Household Controller
 */
groceries.controller('householdController', ['$scope', '$http', '$location', 'auth', 'store', '$state', 'States',
  /**
  * Anonymous household controller function
  * @class householdController
  */
  function ($scope, $http, $location, auth, store, $state, States) {
    /**
     * initializes $scope variables to store received data and interaction states (private)
     * @method init()
     */
    var init = function(){
      // set state to 'household' when loading this view
      States.setState('household');
      //initialize object to hold all scope elements, avoids child scope issues with ng-if statements
      $scope.s = {};
      $scope.s.profile = auth.profile;
      $scope.s.profile.household = {};
      $scope.s.profile.household.id = store.get('householdId');
      //initialize household as null
      $scope.s.household = null;
      
      //holds user inputs
      $scope.s.inputs = {householdName: "", emails: []};

      //holds current inputs without saving to the input object
      $scope.s.currentEmail = "";

      //dynamic method variables for create household button, set to "" to enable button
      $scope.s.createButtonActive = "disabled";
      $scope.s.addEmailActive = "disabled";

      //used to toggle the create button/loading icon when form submitted, also toggles forms enabled/disabled
      $scope.s.submitted = false;
      $scope.s.joinSubmitted = false;
    };
    init();

    /**
     * function to request user info from server (private)
     * @method getUser()
     */
    var getUser = function(){
      $scope.s.getUserFinished = false;
      $http.get('/user/' + $scope.s.profile.user_id.split('|')[1])
      .then(function(res){
        console.log('getUser(): ', res);
        $scope.s.profile.household.user = res.data;
        $scope.s.getUserFinished = true;
      }, function(err){
        console.log('Error in getUser: ', err);
        $scope.s.getUserFinished = false;
        Materialize.toast('Ooops, check your connection and try again.', 10000);
      });
    };

    /**
     * function to request household info from server (private)
     * @method getHousehold()
     */
    var getHousehold = function(){
      $scope.s.getHouseholdFinished = false;
      $http.get('/household/' + $scope.s.profile.household.id)
        .then(function(res){
          console.log('getHousehold(): ', res.data);
          angular.extend($scope.s.profile.household, res.data);
          if ($scope.s.profile.household.name !== ""){
            $location.path( "/household" );
          }
          $scope.s.getHouseholdFinished = true;
        }, function(err){
          console.log('ERROR in householdController getHousehold()', err);
          $scope.s.getHouseholdFinished = false;
          Materialize.toast('Ooops, check your connection and try again.', 10000);
      });
    };
    //invoke getUser and getHousehold on page load
    getUser();
    getHousehold();


    /**
     * function to store email in local variable until submission occurs (attached to $scope.s)
     * @method submitEmail()
     */
    $scope.s.submitEmail = function(){
      if ($scope.s.currentEmail !== ""){
        $scope.s.inputs.emails.push($scope.s.currentEmail);
        $scope.s.currentEmail = "";
        $scope.s.checkInputs();
      }
    };

    //checks if all inputs entered and activates 'create' button
    //emailForm is used to check if valid email has been entered, if so it enables add button
    /**
     * function to check that user inputs are valid
     * @method checkInputs()
     */
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
          i.emails.length >= 1) {
        $scope.s.createButtonActive = "";
      }
      else {
        $scope.s.createButtonActive = "disabled";
      }
    };

    //inserts the clicked email into the edit form, deletes it from the input object
    /**
     * function to edit email in list of unsent invitations
     * @method editEmail()
     * @param email {String}
     * the email address to edit
     * @param index {Number}
     * the index of the email within the $scope.s.inputs.emails array
     */
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

    //sends household information to server
    /**
     * function to send household information to server
     * @method sendHousehold()
     * @param cb {Function}
     * callback to be executed on success
     */
    var sendHousehold = function(cb){
      cb = cb || null;
      $scope.s.sendHouseholdFinished = false;
      console.log('sendHousehold: ' + $scope.s.profile.household.id + ' ' + $scope.s.inputs.householdName);
      $http.put('/household', {household: $scope.s.profile.household.id, name: $scope.s.inputs.householdName})
        .then(function(res){
          console.log('sentHoushold: ', res);
          $scope.s.sendHouseholdFinished = true;
          if (cb){
            cb();
          }
          redirect();
        }, function(err){
          console.log('ERROR in householdController sendHousehold()', err);
          $scope.submitted = false;
          Materialize.toast('Ooops, check your connection and try again.', 10000);
      });
    };

    //invites each user in an array to join a household, takes callback
    /**
     * function to send invite requests to server for a list of emails
     * @method inviteUsers()
     * @param emails {Array}
     * array of "emails"
     * @param cb {Function}
     * callback to be executed when invites are successfuly sent
     */
    var inviteUsers = function(emails, cb){
      cb = cb || null;
      $scope.s.inviteUsersFinished = false;
      var todo = [emails.length, 0];
      emails.forEach(function(email){
        $http.post('/user/invite', {household: $scope.s.profile.household.id, inviteeEmail: email})
        .then(function(res){
          console.log('sending invite...');
          todo[1]++;
          if (todo[0] === todo[1]){
            console.log('all invites sent...');
            $scope.s.inviteUsersFinished = true;
            redirect();
            if (cb){
              cb();
            }
          }

        },function(err){
          console.log('ERROR in householdController inviteUsers(): ', err);
          $scope.submitted = false;
          Materialize.toast('Ooops, check your connection and try again.', 10000);
        });
      });
    };

    /**
     * function to redirect to household page when inviteUsersFinished and sendHouseholdFinished
     * @method redirect()
     */
    var redirect = function(){
      console.log('redirect attempt: ' + $scope.s.inviteUsersFinished + " " + $scope.s.sendHouseholdFinished);
      if ($scope.s.inviteUsersFinished && $scope.s.sendHouseholdFinished){
        console.log('redirecting...');
        $location.path( "/household" );
      }
    };

    //submits the household data to server, then redirects to household page
    /**
     * function to submit household to server and then send any invites
     * @method submitHousehold()
     */
    $scope.s.submitHousehold = function(){
      if ($scope.s.createButtonActive !== "disabled"){
        $scope.s.submitted = true;
        sendHousehold(inviteUsers($scope.s.inputs.emails));
      }
    };

    //submits a single invite to server
    /**
     * function to submit a single invite to the server
     * @method newInvite()
     * @param email {String}
     * email to be invited
     */
    $scope.s.newInvite = function(email){
      if ($scope.s.currentEmail !== ""){
        $scope.s.submitted = true;
        inviteUsers([email], function(){
          $scope.s.currentEmail = "";
          getHousehold();
          $scope.s.submitted =  false;
        });
      }
    };

    /**
     * function join household (attached to $scope.s)
     * @method joinHouse()
     * @param hhid {String}
     * hhid is the householdId to be joined
     */
    $scope.s.joinHouse = function(hhid){
      $scope.s.joinSubmitted = true;
      updateHouse(hhid, $scope.s.profile.email, true, function(res){
        store.set('householdId', res.data);
        $state.go($state.current, {}, {reload: true});
      });
      
    };

    /**
     * function to reject household invitation (attached to $scope.s)
     * @method rejectHouse()
     * @param hhid {String}
     * hhid is the householdId to be rejected
     */
    $scope.s.rejectHouse = function(hhid){
      $scope.s.joinSubmitted = true;
      updateHouse(hhid, $scope.s.profile.email, false, function(res){
        store.set('householdId', res.data);
        $state.go($state.current, {}, {reload: true});
      });
      
    };

    /**
     * function to send request to server to join household (private)
     * @method updateHouse()
     * @param hhid {String}
     * is the householdId to be joined
     * @param email {String}
     * is the current users email
     * @param accept {Boolean}
     * true to accept invitation, false to reject
     * @param cb {Function}
     * callback to be executed on success
     */
    var updateHouse = function(hhid, email, accept, cb){
      cb = cb || null;
      if (hhid === null || email === null || accept === null){
        console.log("Must pass 3 args to updateHouse");
        return;
      }
      $http.put('/user/invite', {household: hhid, inviteeEmail: email, accept: accept})
      .then(function(res){
        if (cb){
          cb(res);
        }
      }, function(err){
        console.log("ERROR in updateHouse: ", err);
      });
    };
  }
]);
