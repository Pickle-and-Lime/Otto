groceries.controller('recipeController', function ($scope, $state, Lists, Recipes, auth, store, States) {
  // set state to 'recipes' when loading this view
  States.setState('recipes');

  $scope.sample = function(searchTerm) {
    Recipes.searchRecipes(searchTerm)
      .then(function(res) {
        console.log('sample SUCCESS:', res.data);
      }, function(err) {
        console.log('sample ERR:', err);
      });
  };

});

groceries.factory('Recipes', function($http) {

  return {

    searchRecipes: function(searchString) {
      var searchEncoded = searchString.split(' ').join('+');
      // probably want to store this info on server side for security
      // would need backend API endpoint in that case
      var apikey = '_app_id=0cefd5cd&_app_key=b9e88801b2ba7dd27e02c08564df2481';
      // var url = 'https://api.yummly.com/v1/api/recipes?'; // may need https when deployed on Heroku
      var url = 'http://api.yummly.com/v1/api/recipes?' + apikey + '&' + searchEncoded + '&callback=(console.log)';
      // var url = 'http://api.yummly.com/v1/api/recipes?' + apikey + '&' + searchEncoded;
      
      return $http.jsonp(url);

    }

  };
});
