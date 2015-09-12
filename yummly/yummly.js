var appKey = 'b9e88801b2ba7dd27e02c08564df2481';
var appID ='0cefd5cd';

var query = function(searchString){
  var words = searchString.split(' ').join('+');
  return words;
};

var url = "http://api.yummly.com/v1/api/recipes?_app_id="+appID+"&_app_key="+appKey+"&q="+query('slow cooker sriracha chicken');

var jsonpRequest = function(url, callback) {

  var script = document.createElement('script');
  script.src = url+'&callback=('+callback+')';

  document.getElementsByTagName('head')[0].appendChild(script);
};

jsonpRequest(url, function (data) {
  console.log('Data', data.matches); 
});
