var sharedb = require('sharedb/lib/client');

try {
    // Expose a singleton WebSocket connection to ShareDB server
    var socket;
    if (process.env.NODE_ENV === 'production'){
        socket = new WebSocket('wss://' + 'api.amonwondra.de:8000/draw');
    } else {
        socket = new WebSocket('ws://' + '127.0.0.1:8000');
    }
    var connection = new sharedb.Connection(socket);
} catch (e) {
    console.log(e)
}

module.exports = connection;
