var express = require('express');
var bodyParser = require('body-parser');
var listRouter = require('./routers/listRouter');
var pantryRouter = require('./routers/pantryRouter');
var itemRouter = require('./routers/itemRouter');
var householdRouter = require('./routers/householdRouter');
var userRouter = require('./routers/userRouter');
var buyRouter = require('./routers/buyRouter');
var db = require('./db.js');


var app = express();

app.use(bodyParser.json());

// Will need to adjust file paths once deployed
// For local, navigate to 127.0.0.1:1337/app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('./public'));
} else {
  console.log("Using client!");
  app.use(express.static('./client'));
}

app.use('/list', listRouter);
app.use('/pantry', pantryRouter);
app.use('/household', householdRouter);
app.use('/user', userRouter);
app.use('/buy', buyRouter);
app.use('/item', itemRouter);

module.exports = {
  app: app,
  db: db
};