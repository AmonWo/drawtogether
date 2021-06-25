var sharedb = require('sharedb/lib/client');

try {
    // Expose a singleton WebSocket connection to ShareDB server
    var socket;
    if (process.env.NODE_ENV === 'production'){
        socket = new WebSocket('wss://' + 'dev.amonwondra.de:8001/api');
    } else {
        socket = new WebSocket('ws://' + '127.0.0.1:8000/api');
    }
    var connection = new sharedb.Connection(socket);
} catch (e) {
    console.log(e)
}

module.exports = connection;
