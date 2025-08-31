import http from "http";
import { app } from "./app";
// (optional) import { attachYjsServer } from "./ws/yjs";

const port = Number(process.env.BE_APP_PORT) || 3333;
const server = http.createServer(app);

// attachYjsServer(server); // if you run y-websocket in the same server

server.listen(port, () => {
  console.log(`HTTP listening on :${port}`);
});
