var sharedb = require('sharedb/lib/client');

// Expose a singleton WebSocket connection to ShareDB server
//var socket = new WebSocket('wss://' + 'dev.amonwondra.de:8000');
var socket = new WebSocket('wss://' + 'localhost:8000');
var connection = new sharedb.Connection(socket);
module.exports = connection;
