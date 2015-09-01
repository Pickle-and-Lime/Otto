var server = require('./server/server');
var port = process.env.PORT || 1337;

server.listen(port, function () {
  console.log('Listening to port %d', port);
});