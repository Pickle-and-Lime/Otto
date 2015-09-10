describe('Pantry Controller', function () {
  var $scope, $rootScope, $httpBackend, createController;

  //Mock modules for testing
  beforeEach(angular.mock.module('GroceriesApp'));
  beforeEach(inject(function($injector) {

    //Mock dependencies
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');

    //Create mock controller
    createController = function () {
      return $controller('pantryController', {
        $scope: $scope,
        auth: {
          profile: { 
            household: {
              householdId: 1
            }
           }
        }
      });
    };

    //Due to current front-end config, these calls will always be made on controller init
    $httpBackend.expectGET('/pantry/general').respond();
    $httpBackend.expectGET('/pantry/household/1').respond();
    createController();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('updatePantry() should retrieve the household\'s pantry from the server', function(){
    $httpBackend.expectGET('/pantry/household/1').respond({pantryList: 'pantryList'});
    $scope.household = 1;
    $scope.updatePantry();
    $httpBackend.flush();
  
    expect($scope).to.have.property('pantryList');
  });

  it('setItem() should set the userPantryItem when invoked', function(){
    $scope.setItem('pie');
    expect($scope.userPantryItem).to.be('pie');
  });

  it('updateMaster() should retrieve the master pantry from the backend', function(){
    $httpBackend.expectGET('/pantry/general').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true}
    });
    $scope.updateMaster();
    $httpBackend.flush();
    expect($scope.masterList.length).to.equal(3);
  });

  it('addItem() should add an item to the pantry and update the scope pantry', function(){
    
    $scope.household = 1;
    $httpBackend.expectPOST('/pantry').respond({pantryList: 'pantryList'});
    $httpBackend.expectGET('/pantry/household/1').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.addItem('item1');
    $httpBackend.flush();
    expect($scope.pantryList.length).to.equal(3);
  });
  
  it('removeItem() should send a request for item removal', function(){
    $scope.household = 1;
    $httpBackend.expectDELETE('/pantry').respond({pantryList: 'pantryList'});
    $httpBackend.expectGET('/pantry/household/1').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.removeItem('item1');
    $httpBackend.flush();
    expect($scope.removeItem).to.be.a('function');
    expect($scope.pantryList.length).to.equal(3);
  });

  it('ranOut() should POST the requested item to the list and update the list', function(){
    $scope.household = 1;
    $httpBackend.expectPOST('/list').respond({pantryList: 'pantryList'});
    $httpBackend.expectGET('/pantry/household/1').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.ranOut('item1');
    $httpBackend.flush();
    expect($scope.pantryList.length).to.equal(3);
  });

  it('needItem() should POST the requested item to the list and update the list', function(){
    $scope.household = 1;
    $httpBackend.expectPOST('/list').respond({pantryList: 'pantryList'});
    $httpBackend.expectGET('/pantry/household/1').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.needItem();
    $httpBackend.flush();
    expect($scope.pantryList.length).to.equal(3);
  });

});