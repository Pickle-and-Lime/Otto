groceries.controller('recipeController', function ($scope, $state, Lists, Recipes, auth, store, States) {
  // set state to 'recipes' when loading this view
  States.setState('recipes');
  $scope.household = store.get('householdId');
  $scope.search = function(searchTerm) {
    Recipes.searchRecipes(searchTerm)
      .then(function(res) {
        $scope.recipes = res.data;
        console.log('sample SUCCESS:', res.data);
      }, function(err) {
        console.log('sample ERR:', err);
      });
  };

  $scope.addAllIngredients = function(ingredients) {
    Lists.addToList('/list/multiple', ingredients, $scope.household);
  };

  $scope.addIngredient = function(ingredients) {
    Lists.addToList('/list', ingredients, $scope.household);
  };
});

groceries.factory('Recipes', function($http) {

  return {
    searchRecipes: function(searchString) {
      var searchEncoded = searchString.split(' ').join('+');
      return $http.get('/recipes/'+searchEncoded);
    }
  };
});
