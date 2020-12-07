var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');

var backend = new ShareDB();
createDoc(startServer);

const uniqId = val => {
  return Math.random()
      .toString(36)
      .substr(2, 6)
}

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  connection.createFetchQuery('drawings', {}, {}, function(err, results) {
    if (err) { throw err; }

    if (results.length === 0) {
      var doc = connection.get('drawings', '0');
      var data = {con_id: 'connection.id', canvas: 'canvasData'};
      doc.create(data);
/*      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
        "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];

      names.forEach(function(name, index) {
        var doc = connection.get('drawings', '' + index);
        var data = {name: name, score: Math.floor(Math.random() * 10) * 5, uid: uniqId(), tales: [1,2,3] };
        doc.create(data);
      });*/
    } else {
      console.log(connection.get('drawings', '0'))
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  server.listen(8000);
  console.log(`Listening on ${server.address().address}${server.address().port}`);
}