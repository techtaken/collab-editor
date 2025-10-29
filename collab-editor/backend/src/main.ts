// src/index.ts

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import http from "http";
// import { setupYjs } from "./yjs-server"; // 👈 REMOVE this
import { setupManualYjsServer } from "./yjs-server-premitive"; // 👈 ADD this
import { WebSocketServer } from "ws";


export const app = express();

app.use(cors({
  origin: process.env.FE_URL?.split(",") ?? "*",  // 👈 exact domain, NOT '*'
  credentials: true,                   // 👈 must be true
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
}));
console.log("xxxx",process.env.FE_URL);

app.options("*", cors());
app.use(express.json({ limit: "1mb" }));

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3333;
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
// setupYjs(server); // 👈 REMOVE this
setupManualYjsServer(wss); // 👈 ADD this

server.on('upgrade', (request, socket, head) => {
  // Use the pathname to distinguish between different WebSocket services if needed.
  // For now, we assume all WebSocket connections are for Y.js.
  
  // This function authenticates the request and hands it off to the 'ws' server.
  wss.handleUpgrade(request, socket, head, (ws) => {
    // The 'ws' server then emits a 'connection' event, which our configureYjsServer handler will catch.
    wss.emit('connection', ws, request);
  });
});

server.listen(3333, process.env.MY_IP, () => console.log("Server on port 3333"));