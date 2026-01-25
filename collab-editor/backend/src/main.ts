// src/index.ts

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import http from "http";

// 1. REMOVE the old manual server import
// import { setupManualYjsServer } from "./yjs-server-premitive";

// 2. ADD the new socket.io server import
import { setupYjsSocketServer } from "./yjs-server-premitive"; // Assuming you named it yjs-server.ts

// 3. REMOVE the ws import
// import { WebSocketServer } from "ws";

export const app = express();

app.use(cors({
  origin: process.env.FE_URL?.split(",") ?? "*",  // 👈 exact domain, NOT '*'
  credentials: true,                   // 👈 must be true
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
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

// 4. REMOVE the manual wss creation
// const wss = new WebSocketServer({ noServer: true });

// 5. CALL the new setup function
setupYjsSocketServer(server); 

// 6. REMOVE the entire server.on('upgrade') handler
// server.on('upgrade', (request, socket, head) => {
//   ...
// });

server.listen(3333, process.env.MY_IP, () => console.log("Server on port 3333"));