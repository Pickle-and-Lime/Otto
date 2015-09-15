/**
* configures server routes
* @module app
* @class app
* @requires express, body-parser, listRouter, pantryRouter, itemRouter, 
* householdRouter, userRouter, buyRouter, merketRouter
*/
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
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
  app.use(express.static('./client'));
}

// Auth0 JWT validation
var client_secret = process.env.AUTH0_CLIENT_SECRET ||
                    require('../config/config').Auth0ClientSecret;
var jwtCheck = jwt({
  secret: new Buffer(client_secret, 'base64'),
  audience: 'Vk8WOzc8NcNXTngDQfYqEvGe00jdK92d'
});

// All protected except GET /user/invite/:id from email
app.use('/list', jwtCheck, listRouter);
app.use('/pantry', jwtCheck, pantryRouter);
app.use('/household', jwtCheck, householdRouter);
app.use('/user', userRouter);
app.use('/buy', jwtCheck, buyRouter);
app.use('/item', jwtCheck, itemRouter);
app.use('/markets', jwtCheck, marketRouter);

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: './public' });
});

module.exports = app;
