var express = require('express');
var bodyParser = require('body-parser');
var listRouter = require('./routers/listRouter');
var pantryRouter = require('./routers/pantryRouter');
var householdRouter = require('./routers/householdRouter');

var app = express();
var port = process.env.PORT || 1337;

app.use(bodyParser.json());

// Will need to adjust file paths once deployed
// For local, navigate to 127.0.0.1:1337/app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
} else {
  app.use(express.static('client'));
}

app.use('/list', listRouter);
app.use('/pantry', pantryRouter);
app.use('/household', householdRouter);

app.listen(port, function () {
  console.log('Listening to port %d', port);
});
