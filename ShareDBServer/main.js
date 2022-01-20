var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');

var backend = new ShareDB();
startServer();
//createDoc(startServer);

function startServer() {
    try {
        // Create a web server to serve files and listen to WebSocket connections
        var app = express();

        var crt = fs.readFileSync(__dirname + '/ssl/ssl.crt', 'utf-8');
        var pk = fs.readFileSync(__dirname + '/ssl/ssl.key', 'utf-8');
        var credentials = {key: pk, cert: crt};
        app.use(express.static('static'));
        var server;
        if (process.env.NODE_ENV === 'production')
            server = https.createServer(credentials, app);
        else
            server = http.createServer(app);
        // Connect any incoming WebSocket connection to ShareDB
        var wss = new WebSocket.Server({server: server});
        wss.on('connection', function (ws) {
            console.log('Clients connected: ', backend.agentsCount);
            var stream = new WebSocketJSONStream(ws);
            backend.listen(stream);
            console.log(backend.db.docs)
        });

        var hostname;
        if (process.env.NODE_ENV === 'production'){
            hostname = 'api.amonwondra.de';
        } else {
            hostname = '127.0.0.1';
        }
        //let hostname = '127.0.0.1';
        //let hostname = 'localhost';
        let port = process.env.PORT || 8000;
        app.set('port', port);

        server.listen(port, hostname);
        console.log(server.address());
        console.log(`Listening on ${hostname}:${port}`);
    } catch (e) {
      console.log(e)
    }
}