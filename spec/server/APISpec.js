var Q = require('q');
var redtape = require('redtape');
var request = require('supertest');
var server = require('../../server/server');
var listController = require('../../server/controllers/listController.js');

var test = redtape({
  beforeEach: function (cb) {
    // Add some starting data before each test
    Q.all([
      listController.addToPantry('milk', 'household1', 7, 30),
      listController.addToPantry('rice', 'household1', 6, 20),
      listController.addToPantry('fruit', 'household1', 7, 23),
      listController.addToPantry('carrots', 'household1', 7, 15)
    ])
    .then(function() {
      cb();
    });
  },
  afterEach: function (cb) {
    // Remove the data (will be useful when we are modifying
    // the neural networks)
    Q.all([
      listController.removeFromPantry('milk', 'household1'),
      listController.removeFromPantry('rice', 'household1'),
      listController.removeFromPantry('fruit', 'household1'),
      listController.removeFromPantry('carrots', 'household1')
    ])
    .then(function() {
      cb();
    });
  }
});

test('Server API - /list', function(t) {
  // request() and its chainable methods
  // are from Supertest
  request(server)
  .get('/list')
  .expect(200)
  .expect('Content-Type', /json/)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .post('/list')
  // Untracked item
  .send({item: 'peanut butter'})
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();

    request(server)
    .delete('/list')
    .send({item: 'peanut butter'})
    .expect(200)
    .end(function(err, res) {
      t.error(err);
      t.end();
    });
  });

  
});


test('Server API - /pantry', function(t) {
  request(server)
  .get('/pantry')
  .expect(200)
  //.expect('Content-Type', /json/)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .get('/pantry/general')
  .expect(200)
  //.expect('Content-Type', /json/)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .post('/pantry')
  .send({item: 'peanut butter'})
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .delete('/pantry')
  .send({item: 'peanut butter'})
  .expect(200)
  .end(function(err, res) {
   t.error(err);
   t.end();
  });
});

test('Server API - /household', function(t) {
  request(server)
  .get('/household')
  .expect(200)
  //.expect('Content-Type', /json/)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .post('/household')
  //.send()
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });

  request(server)
  .delete('/household')
  //.send()
  .expect(200)
  .end(function(err, res) {
   t.error(err);
   t.end();
  });
});

test('Server API - /buy', function(t) {
  request(server)
  .post('/buy')
  .send({items: ['milk', 'rice']})
  .expect(201)
  .end(function(err, res) {
    t.error(err);
    t.end();
  });
});