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
    const documentId = doc.name as string; 

    if (!documentId || typeof documentId !== 'string') {
      console.error('❌ Could not extract documentId');
      return; 
    }

    console.log(`[Yjs] Document loaded: ${documentId}`);

    // Load from DB
    const existingContent = await loadDocumentContent(documentId);
    if (existingContent) {
      const ytext = (doc as Y.Doc).getText('content');
      if (ytext.length === 0) {
        console.log(`📥 Seeding DB content into Y.Text: ${existingContent.slice(0, 50)}`);
        ytext.insert(0, existingContent);
      }
    }

    // Persist updates
    doc.on('update', () => {
      if (saveTimeouts.has(documentId)) {
        clearTimeout(saveTimeouts.get(documentId)!);
      }
      const timeout = setTimeout(async () => {
        try {
          const contentText = doc.getText('content').toString();
          console.log(`💾 Persisting update for ${documentId}: ${contentText.slice(0, 50)}`);
          await saveDocumentContent(documentId, contentText, 'javascript');
          saveTimeouts.delete(documentId);
        } catch (error) {
          console.error(`❌ Save failed for ${documentId}:`, error);
        }
      }, 2000);
      saveTimeouts.set(documentId, timeout);
    });
  });

  ysocketio.initialize();
};