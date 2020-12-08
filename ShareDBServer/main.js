var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');

var backend = new ShareDB();
startServer()
//createDoc(startServer);

const uniqId = val => {
  return Math.random()
      .toString(36)
      .substr(2, 6)
};

/*// Create initial document then fire callback
function createDoc(callback) {
  console.log('createDoc called');
  var connection = backend.connect();
  connection.createFetchQuery('drawings', {}, {}, function(err, results) {
    if (err) { throw err; }

    if (results.length === 0) {
      var doc = connection.get('drawings', 'drawplaceName');
      var data = {drawplaceName: '', canvas: []};
      doc.create(data);
      console.log('CREATED NEW DOC: ', doc.data)
    } else {
      console.log('DOC EXISTS -> RETURN DRAWINGS[0]');
      console.log(connection.get('drawings', '0'))
    }
    callback();
  });
}

function createNewDoc() {

}*/


function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);
  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws) {
    console.log('Clients connected: ', backend.agentsCount);
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
    console.log(backend.db.docs)
  });

  server.listen(8000);
  console.log(`Listening on ${server.address().address}${server.address().port}`);
}
