// Include app dependency on ngMaterial
var groceries = angular.module( 'GroceriesApp', ['ui.router'] );

groceries.config(function($stateProvider) {
  $stateProvider

    .state('login', {
      url: "/login",
      views: {
        "content1": { templateUrl: "user/login.html",
                      controller: "userController" 
                    },
        "title": { template: "Rosie" }
      }
    })
    .state('about', {
      url: "/about",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "general/about.html" },
        "title": { template: "Rosie" }
      }
    })
    // .state('activeUser', {
    //   abstract: true,
    //   url: "/user",
    //   // views: {"menu": { templateUrl: "ui/menu.html",
    //   //                       controller: "listController" 
    //   //                     }
    //   //        },
    //   template: '<ui-view/>'
    // })
    .state('landing', {
      url: "/landing",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "lists/landing.html",
                      controller: "listController" 
                    },
        "title": { template: "Rosie" }
      }
    })
    .state('list', {
      url: "/list",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "lists/list.html",
          controller: "listController"
        },
        "title": { template: "My List" }
      }
    })
    .state('pantry', {
      url: "/pantry",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "lists/pantry.html",
                      controller: "listController"
                    },
        "title": { template: "My Pantry" }
      }
    })
    // .state('recipes', {
    //   url: "/recipes",
    //   views: {
    //     "content1": { templateUrl: "views/recipes.html" },
    //     "title": { template: "My Recipes" }
    //   }
    // })
    .state('household', {
      url: "/household",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "household/household.html",
                      controller: "householdController"
                    },
        "title": { template: "My Household" }
      }
    })
    .state('createHousehold', {
      url: "/createHousehold",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": {templateUrl: "household/createHousehold.html",
                      controller: "householdController"
                    },
        "title": { template: "Create Household"}
      }
    })
    .state('account', {
      url: "/account",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "user/account.html" },
        "title": { template: "My Account" }
      }
    })
    .state('logout', {
      url: "/logout",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                      controller: "listController"
                     },
        "content1": { templateUrl: "user/logout.html" },
        "title": { template: "Rosie" }
      }
    });

});