// yjs-server.ts
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { IncomingMessage } from 'http';

// ===== Types =====

interface DocConnection {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  connections: Set<WebSocket>;
}

interface IPersistence {
  loadDoc(docName: string): Promise<Uint8Array | null>;
  saveDoc(docName: string, update: Uint8Array): Promise<void>;
}

// ===== Storage =====

const docs = new Map<string, DocConnection>();

// ===== Persistence Layer =====

class DatabasePersistence implements IPersistence {
  async loadDoc(docName: string): Promise<Uint8Array | null> {
    // TODO: Implement your database loading logic
    // Example with PostgreSQL:
    // const result = await pool.query(
    //   'SELECT state FROM yjs_documents WHERE name = $1',
    //   [docName]
    // );
    // return result.rows[0]?.state || null;
    
    console.log(`📂 Loading document: ${docName}`);
    return null;
  }

  async saveDoc(docName: string, update: Uint8Array): Promise<void> {
    // TODO: Implement your database saving logic
    // Example with PostgreSQL:
    // const state = Buffer.from(update);
    // await pool.query(
    //   `INSERT INTO yjs_documents (name, state, updated_at) 
    //    VALUES ($1, $2, NOW()) 
    //    ON CONFLICT (name) 
    //    DO UPDATE SET state = $2, updated_at = NOW()`,
    //   [docName, state]
    // );
    
    console.log(`💾 Saving document: ${docName} (${update.length} bytes)`);
  }
}

const persistence = new DatabasePersistence();

// ===== Document Management =====

async function getYDoc(docName: string): Promise<DocConnection> {
  if (docs.has(docName)) {
    return docs.get(docName)!;
  }

  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);
  const connections = new Set<WebSocket>();

  // Load persisted state from database
  try {
    const persistedState = await persistence.loadDoc(docName);
    if (persistedState) {
      Y.applyUpdate(doc, persistedState);
      console.log(`✓ Loaded persisted state for: ${docName}`);
    }
  } catch (error) {
    console.error(`❌ Error loading document ${docName}:`, error);
  }

  // Auto-save updates to database
  doc.on('update', async (update: Uint8Array) => {
    try {
      await persistence.saveDoc(docName, update);
    } catch (error) {
      console.error(`❌ Error saving document ${docName}:`, error);
    }
  });

  const docConnection: DocConnection = { doc, awareness, connections };
  docs.set(docName, docConnection);

  console.log(`📄 Document created: ${docName}`);
  return docConnection;
}

function cleanupDoc(docName: string): void {
  const docConnection = docs.get(docName);
  if (docConnection && docConnection.connections.size === 0) {
    docConnection.doc.destroy();
    docs.delete(docName);
    console.log(`🗑️  Document cleaned up: ${docName}`);
  }
}

// ===== WebSocket Communication =====

function send(ws: WebSocket, encoder: encoding.Encoder): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(encoding.toUint8Array(encoder));
  }
}

function broadcastMessage(
  connections: Set<WebSocket>,
  message: Uint8Array,
  exclude?: WebSocket
): void {
  connections.forEach((conn) => {
    if (conn !== exclude && conn.readyState === WebSocket.OPEN) {
      conn.send(message);
    }
  });
}

// ===== Message Handlers =====

function messageHandler(
  ws: WebSocket,
  docConnection: DocConnection,
  message: Uint8Array
): void {
  const { doc, awareness, connections } = docConnection;
  const encoder = encoding.createEncoder();
  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case syncProtocol.messageYjsSyncStep1: {
      // Client sends sync step 1, we respond with step 2
      encoding.writeVarUint(encoder, syncProtocol.messageYjsSyncStep2);
      syncProtocol.writeSyncStep2(encoder, doc);
      send(ws, encoder);
      break;
    }

    case syncProtocol.messageYjsSyncStep2: {
      // Client sends sync step 2, apply updates
      syncProtocol.readSyncStep2(decoder, doc, null);
      break;
    }

    case syncProtocol.messageYjsUpdate: {
      // Client sends document update
      syncProtocol.readUpdate(decoder, doc, null);
      // Broadcast to all other clients
      broadcastMessage(connections, message, ws);
      break;
    }

    // case awarenessProtocol.messageAwareness: {
    //   // Client sends awareness update (cursor position, user info, etc.)
    //   awarenessProtocol.applyAwarenessUpdate(
    //     awareness,
    //     decoding.readVarUint8Array(decoder),
    //     null
    //   );
    //   // Broadcast to all other clients
    //   broadcastMessage(connections, message, ws);
    //   break;
    // }

    default:
      console.warn(`⚠️  Unknown message type: ${messageType}`);
  }
}

// ===== Connection Setup =====

async function setupConnection(
  ws: WebSocket,
  req: IncomingMessage,
  docName: string
): Promise<void> {
  ws.binaryType = 'arraybuffer';

  // Get or create document
  const docConnection = await getYDoc(docName);
  const { doc, awareness, connections } = docConnection;

  // Track this connection
  connections.add(ws);

  // Send sync step 1 to initialize the client
  const encoderSync = encoding.createEncoder();
  encoding.writeVarUint(encoderSync, syncProtocol.messageYjsSyncStep1);
  syncProtocol.writeSyncStep1(encoderSync, doc);
  send(ws, encoderSync);

  // Send current awareness states (all connected users)
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoderAwareness = encoding.createEncoder();
    // encoding.writeVarUint(encoderAwareness, awarenessProtocol.messageAwareness);
    encoding.writeVarUint8Array(
      encoderAwareness,
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(ws, encoderAwareness);
  }

  // Handle incoming messages
  ws.on('message', (message: ArrayBuffer) => {
    try {
      messageHandler(ws, docConnection, new Uint8Array(message));
    } catch (error) {
      console.error(`❌ Error handling message for ${docName}:`, error);
    }
  });

  // Handle connection close
  ws.on('close', () => {
    connections.delete(ws);
    
    // Remove awareness state for this connection
    awarenessProtocol.removeAwarenessStates(
      awareness,
      Array.from(awareness.getStates().keys()).filter(
        (client) => !Array.from(connections).some((conn: any) => conn.clientId === client)
      ),
      null
    );

    console.log(`👋 Client disconnected from: ${docName} (${connections.size} remaining)`);

    // Schedule cleanup if no connections remain
    if (connections.size === 0) {
      setTimeout(() => cleanupDoc(docName), 30000); // 30 second grace period
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${docName}:`, error);
  });

  console.log(`✓ Client connected to: ${docName} (${connections.size} total)`);
}

// ===== Main Setup Function =====

export function setupYjsServer(wss: WebSocketServer): () => void {
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    try {
      // Extract document name from query parameter
      // Example: ws://host:port/yjs?doc=my-document
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const docName = url.searchParams.get('doc') || 'default';

      // Validate document name (optional security check)
      if (!/^[\w-]+$/.test(docName)) {
        console.warn(`⚠️  Invalid document name: ${docName}`);
        ws.close(1008, 'Invalid document name');
        return;
      }

      await setupConnection(ws, req, docName);
    } catch (error) {
      console.error('❌ Error setting up Yjs connection:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  wss.on('error', (error) => {
    console.error('❌ WebSocket server error:', error);
  });

  console.log('✓ Yjs WebSocket server initialized');

  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up Yjs resources...');
    docs.forEach((docConnection, docName) => {
      docConnection.doc.destroy();
      console.log(`  ✓ Destroyed document: ${docName}`);
    });
    docs.clear();
  };
}

// ===== Optional: Export for direct access =====

// export { docs, persistence, getYDoc, cleanupDoc...