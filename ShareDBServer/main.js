//var http = require('http');
var https = require('https');
var fs = require('fs')
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
  var crt = fs.readFileSync(__dirname + '/ssl/ssl.crt', 'utf-8')
  var pk = fs.readFileSync(__dirname + '/ssl/ssl.key', 'utf-8')
  var credentials = {key: pk, cert: crt}
  app.use(express.static('static'));
  var server = https.createServer(credentials, app);
  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws) {
    console.log('Clients connected: ', backend.agentsCount);
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
    console.log(backend.db.docs)
  });

  //let hostname = 'dev.amonwondra.de'
  let hostname = 'localhost'
  let port = 8000

  server.listen(port, hostname);
  console.log(server.address())
  console.log(`Listening on ${hostname}:${port}`);
}
