describe('List Controller', function () {
  var $scope, $rootScope, $httpBackend, createController;

  //Mock modules for testing
  beforeEach(angular.mock.module('GroceriesApp'));
  beforeEach(inject(function($injector) {

    //Mock dependencies
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');
    var $auth = $injector.get('auth');

    //Create mock controller
    createController = function () {
      return $controller('listController', {
        $scope: $scope,
        //store's get function will not contain anything in a standalone controller
        //therefore we create a mock that returns what we need for testing
        store: {
          get: function(){ 
            return 1;
           }
        }
      });
    };
    
    //Due to current front-end config, these calls will always be made on controller init
    $httpBackend.expectGET('/pantry/general').respond();
    $httpBackend.expectGET('/list/1').respond();
    $httpBackend.expectGET('user/login.html').respond();
    createController();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingRequest();
  }));

  it('toggleCheck() should toggle the checked property of an item', function(){
    $scope.shoppingList = { item1: { checked: false }, item2: { checked: false}, item3: { checked: false } };
    $scope.toggleCheck('item2');
    expect($scope.shoppingList.item2.checked).to.be(true);
  });

  it('checkoutList()', function(){
    $scope.household = 1;
    $scope.shoppingList = [{name: 'item1', checked: true}, {name: 'item2' , checked: false}, {name: 'item3', checked: true}];
    $httpBackend.expectPOST('/buy').respond();
    $httpBackend.expectGET('/list/1').respond();
    $scope.checkoutList();
    //In future, use spy to check args sent to POST req
    expect($scope.checkoutList).to.be.a('function');
  });

  it('updateMaster() should update the master list', function(){
    $scope.household = 1;
    $httpBackend.expectGET('/pantry/general').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true}
    });
    $scope.updateMaster();
    $httpBackend.flush();
    expect($scope.masterList.length).to.equal(3);
  });


  it('addItem() should POST the requested item and update the list', function(){
    //Update list is the final result of these functions, if it is called then behavior is as desired
    var spy = sinon.spy($scope, 'updateList');
    
    $scope.household = 1;
    $scope.shoppingList = [{clearly : 'incorrectValue'}];
    $httpBackend.expectPOST('/list').respond();
    $httpBackend.expectGET('/list/1').respond(
      { item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.addItem('item1');
    $httpBackend.flush();
    //Test if updateList was called
    expect(spy.called).to.equal(true);
  });
  
  it('removeItem() should DELETE the requested item and update the list', function(){
    //Update list is the final result of these functions, if it is called then behavior is as desired
    var spy = sinon.spy($scope, 'updateList');

    $scope.household = 1;
    $scope.shoppingList = [{clearly : 'incorrectValue'}];
    $httpBackend.expectDELETE('/list/1/item1').respond({pantryList: 'pantryList'});
    $httpBackend.expectGET('/list/1').respond(
      {item1 : {checked: true}, item2 : {checked: true}, item3 : {checked: true} }
    );
    $scope.removeItem('item1');
    $httpBackend.flush();
    expect($scope.removeItem).to.be.a('function');
    //Test if updateList was called
    expect(spy.called).to.equal(true);
  });



});