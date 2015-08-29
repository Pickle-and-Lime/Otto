// Include app dependency on ngMaterial
var groceries = angular.module( 'GroceriesApp', ['ui.router'] );

groceries.config(function($stateProvider) {
  $stateProvider
    .state('landing', {
      url: "/landing",
      views: {
        "mainArea": { templateUrl: "lists/landing.html",
                      controller: "listController" 
                    },
        "title": { template: "Rosie" }
      }
    })
    .state('list', {
      url: "/list",
      views: {
        "mainArea": { templateUrl: "lists/list.html",
                      controller: "listController"
                     },
        "title": { template: "My List" }
      }
    })
    .state('pantry', {
      url: "/pantry",
      views: {
        "mainArea": { templateUrl: "lists/pantry.html",
                      controller: "listController"
                    },
        "title": { template: "My Pantry" }
      }
    })
    // .state('recipes', {
    //   url: "/recipes",
    //   views: {
    //     "mainArea": { templateUrl: "views/recipes.html" },
    //     "title": { template: "My Recipes" }
    //   }
    // })
    .state('household', {
      url: "/household",
      views: {
        "mainArea": { templateUrl: "household/household.html" },
        "title": { template: "My Household" }
      }
    })
    .state('account', {
      url: "/account",
      views: {
        "mainArea": { templateUrl: "user/account.html" },
        "title": { template: "My Account" }
      }
    })
    .state('about', {
      url: "/about",
      views: {
        "mainArea": { templateUrl: "general/about.html" },
        "title": { template: "Rosie" }
      }
    })
    .state('logout', {
      url: "/logout",
      views: {
        "mainArea": { templateUrl: "user/logout.html" },
        "title": { template: "Rosie" }
      }
    });

});