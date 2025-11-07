// src/yjs-server.ts

import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';
import { YSocketIO } from 'y-socket.io/dist/server'; // Your correct path
import jwt from 'jsonwebtoken';

export const setupYjsSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FE_URL?.split(",") ?? "*",
      credentials: true,
    },
  });

  // --- THIS IS THE FIX ---
  // We use Socket.IO's middleware to check auth on *every* new connection.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;

    try {
      if (!token) {
        throw new Error('No token provided');
      }
      // This will throw if the token is invalid
      jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
      
      console.log(`[Auth] Client authorized: ${socket.id}`);
      next(); // Auth succeeded, allow connection
    } catch (err) {
      console.warn(`[Auth] Client REJECTED ${socket.id}: ${err.message}`);
      next(new Error('Authentication error')); // Auth failed, reject connection
    }
  });

  // --- END OF FIX ---

  // Now, the YSocketIO instance is created *without* the auth config,
  // because auth is already handled.
  const ysocketio = new YSocketIO(io);

  // Start the server
  ysocketio.initialize();

  console.log('✅ Y.js Socket.IO server initialized');
};