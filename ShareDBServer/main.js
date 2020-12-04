const http = require("http");
const express = require("express");
const ShareDB = require("sharedb");
const WebSocket = require("ws");
const WebSocketJSONStream = require("websocket-json-stream");

const app = express();
app.use(express.static("static"));
app.use(express.static("node_modules/quill/dist"));

const backend = new ShareDB();
const connection = backend.connect();

// 0: Name of collection
// 1: ID of document
let doc = connection.get("examples", "richtext");

doc.fetch(err => {
  if (err) {
    throw err;
  }
  if (doc.type === null) {
    return doc.create([{ insert: "Say Something!" }], "clipmon", startServer);
  }
  startServer();
});

function startServer() {
  const server = http.createServer(app);

  const ws = new WebSocket.Server({
    server: server
  });

  ws.on("connection", (ws, req) => {
    console.log("New client connected");

    backend.listen(new WebSocketJSONStream(ws));

    ws.on("message", function message(msg) {
      console.log(msg);
    });
  });

  server.listen(8000, () =>
    console.log(`Editor now live on http://${server.address().address}:${server.address().port}`)
  );
}
