// src/yjs-server.ts

import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import  jwt  from 'jsonwebtoken';
import * as url from 'url';
import { log } from 'console';


const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;



// --- Document and Connection Management ---
const docs = new Map<string, Y.Doc>();
const docConnections = new Map<string, Set<WebSocket>>();
// ✨ NEW: Map to store awareness states for each document
const docAwarenessStates = new Map<string, awarenessProtocol.Awareness>();

/**
 * Gets or creates a Y.Doc and its associated Awareness instance.
 */
const getOrCreateDoc = (docName: string): [Y.Doc, awarenessProtocol.Awareness] => {
  let doc = docs.get(docName);
  let awareness = docAwarenessStates.get(docName);

  if (!doc) {
    doc = new Y.Doc();
    awareness = new awarenessProtocol.Awareness(doc);
    docs.set(docName, doc);
    docAwarenessStates.set(docName, awareness);
    docConnections.set(docName, new Set());
  }

  return [doc!, awareness!];
};

/**
 * Broadcasts a message to all clients subscribed to a specific document.
 */
const broadcastToOthers = (docName: string, sender: WebSocket, message: Uint8Array) => {
  const connections = docConnections.get(docName);
  console.log(`[BroadcastToOthers] Found ${connections?.size} connections for doc ${docName}`);
  connections?.forEach(conn => {
    if (conn !== sender && conn.readyState === WebSocket.OPEN) {
      console.log(`[BroadcastToOthers] Sending message to another client`, message.length);
      conn.send(message);
    }
  });
};
/**
 * Handles incoming messages from a WebSocket connection.
 * ✨ FIX: Now accepts the correct awareness instance.
 */
const messageHandler = (conn: WebSocket, doc: Y.Doc, awareness: awarenessProtocol.Awareness, message: Buffer) => {
  const docName = [...docs.entries()].find(([_, d]) => d === doc)?.[0];
  console.log("docName", docName);
  
  if (!docName) return;

  const messageCopy = new Uint8Array(message);
  const encoder = encoding.createEncoder();
  const decoder = decoding.createDecoder(message);

  const messageType = decoding.readVarUint(decoder);
  log("messageType", messageType);

  switch (messageType) {
    case MESSAGE_SYNC:
      console.log('[Server] Received MESSAGE_SYNC');
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

      // This is correct. Length will be 1, and this block will be skipped.
      if (encoding.length(encoder) > 1) {
        conn.send(encoding.toUint8Array(encoder));
      }

      // This is the REAL broadcast
      console.log('[Server] Broadcasting original update to other clients');
      broadcastToOthers(docName, conn, messageCopy);
      break;

    case MESSAGE_AWARENESS:
      console.log('[Server] Received MESSAGE_AWARENESS');
      awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
      broadcastToOthers(docName, conn, messageCopy); // Broadcast awareness
      break;
  }
};

/**
 * Sets up the WebSocket server and its event listeners.
 */
export const setupManualYjsServer = (wss: WebSocketServer) => {
  // const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const requestUrl = url.parse(req.url!, true);
    const token = requestUrl.query.token as string;

    // 1. 👈 NEW: Gracefully handle auth failure
    try {
      if (!token) {
        console.warn('[Server] Auth failed: No token provided.');
        ws.close(1008, 'No token provided');
        return;
      }
      // This will throw an error if verification fails
      jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
    
    } catch (err) {
      console.warn(`[Server] Auth failed: ${err.message}`);
      ws.close(1008, 'Invalid token');
      return;
    }
    
    // 2. 👈 FIX: Get docName from `pathname` to exclude query string
    const docName = requestUrl.pathname?.slice(1); 

    if (!docName) {
      ws.close(1011, 'Document name is required');
      return;
    }
    
    // 3. 👈 Your validation logic is good
    if (docName.length < 36 || docName.startsWith('socket.io')) {
      console.warn(`[Server] Rejected connection with invalid URL: ${req.url}`);
      ws.close(1011, 'Invalid document ID');
      return;
    }



    // const requestUrl = url.parse(req.url!, true);
    // const token = requestUrl.query.token as string; // Get token from ?token=...

    // if (!token) { /* ... reject connection ... */ return; }
    // jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
    
    // const docName = req.url?.slice(1); // Get docId from pathname
    // if (!docName) {
    //   ws.close(1011, 'Document name is required');
    //   return;
    // }
    if (!docName || docName.length < 36 || docName.startsWith('socket.io')) {
      console.warn(`[Server] Rejected connection with invalid URL: ${req.url}`);
      ws.close(1011, 'Invalid document ID');
      return;
    }

    console.log("docName", docName);
    

    // ✨ FIX: Get both the doc and awareness instance
    const [doc, awareness] = getOrCreateDoc(docName);
    docConnections.get(docName)?.add(ws);

    console.log(`[${docName}] Client connected. Total clients: ${docConnections.get(docName)?.size}`);

    ws.on('close', () => {
      docConnections.get(docName)?.delete(ws);
      console.log(`[${docName}] Client disconnected. Total clients: ${docConnections.get(docName)?.size}`);

      if (docConnections.get(docName)?.size === 0) {
        docs.delete(docName);
        docConnections.delete(docName);
        // ✨ NEW: Clean up the awareness state as well
        docAwarenessStates.delete(docName);
        console.log(`[${docName}] Document removed from memory.`);
      }
    });

    // ✨ FIX: Pass the awareness instance to the message handler
    ws.on('message', (message: Buffer) => {
      // 1. Add a log to see if ALL messages are arriving
      console.log(`[Server] Received message of size ${message.length} from a client.`);
      
      // 2. Wrap the handler in a try...catch block
      try {
        messageHandler(ws, doc, awareness, message);
      } catch (err) {
        // 3. Log any error that happens during message processing
        console.error(`[Server] FAILED to handle message: ${err.message}`);
        
        // You could even log the message that failed
        // console.error("Failed message data:", message.toString('hex'));
      }
    });

    
    // --- Send initial sync data to the new client ---
    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, doc);
    ws.send(encoding.toUint8Array(syncEncoder));

    // ✨ FIX: Use the correct awareness instance to send the initial state
    if (awareness.getStates().size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }
  });

  console.log('✅ Manual Y.js WebSocket server initialized');
};