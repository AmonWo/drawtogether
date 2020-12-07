var sharedb = require('sharedb/lib/client');

// Expose a singleton WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + '127.0.0.1:8000');
var connection = new sharedb.Connection(socket);
module.exports = connection;