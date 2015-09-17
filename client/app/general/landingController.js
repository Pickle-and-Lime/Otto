groceries.controller('landingController', function($scope, Seasonal, Landing, States, Lists, store) {

  // set state to 'landing' when loading this view
  States.setState('landing');
  // grab household id from angular storage
  $scope.household = store.get('householdId');
  // grab user zip code from angular storage
  $scope.zip = store.get('zip');
  console.log('householdId:', $scope.household, 'zipcode:', $scope.zip);
  // functions to load correct set of seasonal fruits and veggies
  $scope.month = (new Date()).getMonth();
  console.log('month is:', $scope.month);
  // function that updates masterList from backend
  $scope.updateMaster = function() { // crashes server for now
    Lists.getList('/pantry/general', $scope.household)
      .then(function(res) {
        // console.log('GET /pantry/general', res.data);
        $scope.masterList = Lists.arrayConverter(res.data);
        console.log('masterList:', $scope.masterList);
        seasonalFilter($scope.masterList);
      }, function(err) {
        console.log('GET /pantry/general ERROR', err);
      });
  };
  // function that updates pantryList from backend
  $scope.updatePantry = function() {
    Lists.getList('/pantry/household/' + $scope.household)
      .then(function(res) {
        // console.log('GET /pantry', res.data);
        $scope.pantryList = res.data;
        console.log('pantryList:', $scope.pantryList);
        $scope.updateMaster();
      }, function(err) {
        console.log('GET /pantry ERR', err);
      });
  };
  // function that updates shopping list from backend
  $scope.updateList = function() {
    Lists.getList('/list/' + $scope.household)
      .then(function(res) {
        // console.log('GET /list:', res.data);
        $scope.shoppingList = res.data;
        $scope.updatePantry();
      }, function(err) {
        console.log('GET /list: ERROR', err);
      });
  };
  // addSeasonalItem adds it to our shopping list
  $scope.addSeasonalItem = function(item) {
    Lists.addToList('/list', item, $scope.household)
      .then(function(res) {
        // console.log('POST to /list', res);
        // update shopping list after add
        $scope.updateList();
      }, function(err) {
        console.log('POST to /list ERROR', err);
      });
  };
  // update the general list and shopping list
  $scope.updateList();
  // function that filters the masterList to only show items in season
  var seasonalFilter = function(list) {
    $scope.seasonalList = [];
    list.forEach(function(itemObj) {
      if (itemObj.season.indexOf($scope.month) !== -1) {
        // modify itemObj with inList and inPantry properties
        itemObj.inList = !!$scope.shoppingList[itemObj.name];
        itemObj.inPantry = !!$scope.pantryList[itemObj.name] && $scope.pantryList[itemObj.name].fullyStocked;
        $scope.seasonalList.push(itemObj);
      }
    });
    console.log('filtered List:', $scope.seasonalList);
  };
  // helpers to find if an item is in the stocked in the pantry or if it is in the list
  // $scope.inPantry = function(item) {
  //   if (!$scope.pantryList[item]) {
  //     return false;
  //   } else {
  //     return $scope.pantryList[item].fullyStocked;
  //   }
  // };

  // $scope.inList = function(item) {
  //   if (!$scope.pantryList[item]) {
  //     return false;
  //   } else {
  //     return !$scope.pantryList[item].fullyStocked;
  //   }
  // };

  /* this will get populated with Farmer's Market objects in the following form:
    {
      name: "Name of market",
      address: "String of market address",
      description: "Longer text of products in market",
      map: "String of link to Google maps",
      schedule: "String of when it is open"
    }
  */
  $scope.markets = [];

  var getMarketList = function() {
    Landing.findMarketbyLoc()
      .then(function(res) {
        console.log('Markets',res);
        $scope.marketArray = res.data.results;
        // console.log($scope.marketArray);
        $scope.marketArray.forEach(function(market) {
          getMarketInfo(market.id, market.marketname);
        });
      }, function(err) {
        console.log('ERR getMarketList:',err);
      });
  };

  var getMarketInfo = function(id, name) {
    Landing.findMarketbyId(id)
      .then(function(res) {
        // console.log(res.data.marketdetails);
        var market = res.data.marketdetails;
        // console.log(market);
        $scope.markets.push(Landing.makeMarketInfo(name, market));
        // console.log($scope.markets);
      }, function(err) {
        console.log('ERR getMarketInfo',err);
      });
  };

  Landing.setZip($scope.zip); // this should be set by user within app

  getMarketList();

});

groceries.factory('Landing', function($http) {

  var userZip; // make it possible to change and retrieve with a method

  return {
    setZip: function(zip) { // zip code should be a string input by user
      userZip = zip;
    },

    getZip: function() {
      return userZip;
    },

    // findMarketbyLoc: function() {
    //   var url = "//search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + userZip;
    //   return $http.get(url, {skipAuthorization: true});
    // },

    findMarketbyLoc: function() {
      return $http.get('/markets/byzip/'+userZip);
    },

    findMarketbyId: function(id) {
      return $http.get('/markets/byid/'+id);
    },

    makeMarketInfo: function(name, market) {
      // correctly format the schedule
      var temp = market.Schedule.split(';')[0];
      if (temp === " <br> <br> <br> ") { temp = 'Schedule Unknown'; }
      return {
        name: name.split(' ').slice(1).join(' '), // take off the distance from the name
        address: market.Address,
        description: market.Products,
        map: market.GoogleLink,
        schedule: temp,
        // grab a random market image to display on card
        image: "../assets/" + Math.floor(Math.random() * 7) + "market.jpg"
      };
    }

  };

});