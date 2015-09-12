groceries.controller('landingController', function($scope, Seasonal, Landing) {


  /* this will get populated with Farmer's Market objects in the following form:
    {
      name: "Name of market",
      address: "String of market address",
      description: "Longer text of products in market",
      map: "String of link to Google maps",
      schedule: "String of when it is open"
    }
  */
  // functions to load correct set of seasonal fruits and veggies
  var month = (new Date()).getMonth();
  console.log('month is:', month);
  var loadSeasonal = function(month) {
    if (month === 0 || month === 1 || month === 2) { 
      $scope.fruit = Seasonal.winterFruit;
      $scope.veggie = Seasonal.winterVeggie;
    } else if (month === 3 || month === 4 || month === 5) { 
      $scope.fruit = Seasonal.springFruit;
      $scope.veggie = Seasonal.springVeggie;
    } else if (month === 6 || month === 7 || month === 8) { 
      $scope.fruit = Seasonal.summerFruit;
      $scope.veggie = Seasonal.summerVeggie;
    } else if (month === 9 || month === 10 || month === 11) { 
      $scope.fruit = Seasonal.fallFruit;
      $scope.veggie = Seasonal.fallVeggie;
    }
  };
  loadSeasonal(month);

  $scope.markets = [];

  var getMarketList = function() {
    Landing.findMarketbyLoc()
      .then(function(res) {
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

  Landing.setZip('95818'); // this should be set by user within app

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

    findMarketbyLoc: function() {
      var url = "//search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + userZip;
      return $http.get(url, {skipAuthorization: true});
    },

    findMarketbyId: function(id) {
      var url = "//search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id;
      return $http.get(url, {skipAuthorization: true});
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