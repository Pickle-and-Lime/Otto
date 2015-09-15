/**
* configures server routes
* @module app
* @class app
* @requires express, body-parser, listRouter, pantryRouter, itemRouter, 
* householdRouter, userRouter, buyRouter, merketRouter
*/
var express = require('express');
var bodyParser = require('body-parser');
var listRouter = require('./routers/listRouter');
var pantryRouter = require('./routers/pantryRouter');
var itemRouter = require('./routers/itemRouter');
var householdRouter = require('./routers/householdRouter');
var userRouter = require('./routers/userRouter');
var buyRouter = require('./routers/buyRouter');
var marketRouter = require('./routers/marketRouter');


var app = express();

app.use(bodyParser.json());

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
app.use('/markets', marketRouter);

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: './public' });
});

module.exports = app;
