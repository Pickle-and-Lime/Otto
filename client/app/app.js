// Include app dependency on ngMaterial
var groceries = angular.module( 'GroceriesApp', ['ui.router', 'auth0', 'angular-storage', 'angular-jwt'] );

// Auth0 services
groceries.config(function (authProvider) {
  authProvider.init({
    domain: 'ejkinger.auth0.com',
    clientID: 'Vk8WOzc8NcNXTngDQfYqEvGe00jdK92d'
  });
})
.run(function(auth) {
  // This hooks al auth events to check everything as soon as the app starts
  auth.hookEvents();
});

//below function is needed to send token? Idk why its not working though.

groceries.config(function (authProvider, $httpProvider, jwtInterceptorProvider) {
  // ...

  // We're annotating this function so that the `store` is injected correctly when this file is minified
  jwtInterceptorProvider.tokenGetter = ['store', function(store) {
    // Return the saved token
    return store.get('token');
  }];

  $httpProvider.interceptors.push('jwtInterceptor');
  // ...
});

groceries.run(function ($rootScope, auth, store, jwtHelper, $location) {
  // This events gets triggered on refresh or URL change
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        // Either show the login page or use the refresh token to get a new idToken
        $location.path('/');
      }
    }
  });
});
// End Auth0 services

groceries.config(function($stateProvider) {
  $stateProvider

    .state('login', {
      url: "/",
      views: {
        "content1": { templateUrl: "user/login.html",
                      controller: "loginController" 
                    },
        "title": { template: "Rosie" }
      }
    })
    .state('about', {
      url: "/about",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                  controller: "menuController"
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
                  controller: "menuController"
                 },
        "content1": { templateUrl: "general/landing.html",
                      controller: "landingController" 
                    },
        "title": { template: "Rosie" }
      }
    })
    .state('list', {
      url: "/list",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                  controller: "menuController"
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
                  controller: "menuController"
                 },
        "content1": { templateUrl: "lists/pantry.html",
                      controller: "pantryController"
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
                  controller: "menuController"
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
                  controller: "menuController"
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
                  controller: "menuController"
                 },
        "content1": { templateUrl: "user/account.html", 
                      controller: "loginController"},
        "title": { template: "My Account" }
      }
    })
    .state('logout', {
      url: "/logout",
      views: {
        "menu": { templateUrl: "ui/menu.html",
                  controller: "menuController"
                 },
        "content1": { templateUrl: "user/logout.html",
                      controller: "loginController"},
        "title": { template: "Rosie" }
      }
    });

});