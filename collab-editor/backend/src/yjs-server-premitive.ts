import { Server as SocketIOServer } from 'socket.io';
import * as http from 'http';
import { YSocketIO } from 'y-socket.io/dist/server';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import { saveDocumentContent, loadDocumentContent } from './services/document.service';

export const setupYjsSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: { origin: process.env.FE_URL?.split(",") ?? "*", credentials: true },
  });

  // Auth Middleware remains the same...
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected : ${socket.id}`);
  });

  const ysocketio = new YSocketIO(io);

  const saveTimeouts = new Map<string, NodeJS.Timeout>();

  // Use the 'document-loaded' event which provides (doc, roomName)
  ysocketio.on('document-loaded', async (doc: any) => { 

    console.log("####document-loaded called");
    
    // 2. Access the runtime property 'name' 
    // We cast doc to 'any' because strict Y.Doc types don't know about this property
    const documentId = doc.name as string; 

    // SAFETY CHECK: Verify we actually got a string before touching the DB
    if (!documentId || typeof documentId !== 'string') {
        console.error('❌ [Yjs Error] Could not extract documentId from doc.name');
        return; 
    }

    console.log(`[Yjs] Document loaded: ${documentId}`);

    // 3. Initial Load from DB
    const existingContent = await loadDocumentContent(documentId);
    if (existingContent) {
      // Cast back to Y.Doc to get strict typing for Yjs operations
      const typedDoc = doc as Y.Doc; 
      const ytext = typedDoc.getText('content');
      
      if (ytext.length === 0) {
        ytext.insert(0, existingContent);
      }
    }

    // 4. Setup Persistence (Debounce logic)
    doc.on('update', () => {
      console.log("update####");
      
      // ... (Your debounce logic remains the same, using documentId) ...
       if (saveTimeouts.has(documentId)) {
        clearTimeout(saveTimeouts.get(documentId)!);
      }
      const timeout = setTimeout(async () => {
        try {
          const contentText = doc.getText('content').toString();
          await saveDocumentContent(documentId, contentText, 'javascript');
          console.log(`[DB] Saved: ${documentId}`);
          saveTimeouts.delete(documentId);
        } catch (error) {
          console.error(`[DB Error] ${documentId}:`, error);
        }
      }, 2000);
      saveTimeouts.set(documentId, timeout);
    });
  });

  ysocketio.initialize();
};