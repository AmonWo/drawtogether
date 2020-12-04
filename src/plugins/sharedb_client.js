import ReconnectingWebSocket from "reconnecting-websocket";

export default class shareDBClient {
    constructor() {
        this.sharedb = require('sharedb/lib/client');
        this.socket = new ReconnectingWebSocket('ws://127.0.0.1:8000');
        this.connection = new this.sharedb.Connection(this.socket);
        console.log('SHAREDB CLIENT CREATED SUCCESSFULLY')
    }
}