// src/components/CodeEditorYjs.tsx

import React, { Suspense, useEffect, useState, useRef } from "react";
const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
// --- Y.js and Protocol Imports ---
import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { EditorView } from "@codemirror/view";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom"; // Make sure this path is correct

// --- Constants ---
const WS_URL = import.meta.env.REACT_APP_WS_URL ?? "ws://localhost:3333";
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

// langExtension function
function langExtension(lang: string) {
  switch (lang) {
    case "javascript":
      return javascript({ jsx: true });
    case "typescript":
      return javascript({ typescript: true });
    case "python":
      return python();
    case "java":
      return java();
    case "html":
      return html();
    case "json":
      return json();
    default:
      return javascript();
  }
}
type Props = {
  language: string;
};

export default function CodeEditorYjs({ language }: Props) {
  const [editorExtensions, setEditorExtensions] = useState<any[]>([]);
  const docId = "11150cda-9f19-495b-98f9-569cc821b055";
  const didInit = useRef(false);
  const user = useRecoilValue(userAtom) ;

  useEffect(() => {
    console.log("docId", docId);

    // 1. Wait for the user and token to be loaded.
    if (!docId || !user?.token) {
        console.log("Waiting for user token...");
        return;
    }

    // 2. Strict Mode guard.
    if (didInit.current) return;
    didInit.current = true;
    
    console.log("oo - Attempting connection with token.");

    // --- Y.js Setup ---
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(ytext);
    const awareness = new awarenessProtocol.Awareness(ydoc);

    // 3. Send the token as a query parameter.
    const ws = new WebSocket(`${WS_URL}/${docId}?token=${user.token}`);
    let connected = false;

    // --- WebSocket Event Handlers ---
    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      connected = true;
      
      // Send initial sync/awareness messages
      const syncEncoder = encoding.createEncoder();
      encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
      syncProtocol.writeSyncStep1(syncEncoder, ydoc);
      ws.send(encoding.toUint8Array(syncEncoder));

      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(awareness, [ydoc.clientID]));
      ws.send(encoding.toUint8Array(awarenessEncoder));
    };



    // Make the message handler async to handle blob conversion
    ws.onmessage = async (event: MessageEvent) => {
      console.log(`--- CLIENT B: RAW MESSAGE RECEIVED! ---`);
      console.log('event.data type:', typeof event.data);
      console.log('event.data content:', event.data);

      let message: Uint8Array;

      // --- THIS IS THE FIX ---
      // Check if data is a Blob and convert it
      if (event.data instanceof ArrayBuffer) {
        console.log("Client B: Received ArrayBuffer");
        message = new Uint8Array(event.data);
      } else if (event.data instanceof Blob) {
        console.log("Client B: Received Blob, converting to ArrayBuffer...");
        try {
          // Asynchronously convert Blob to ArrayBuffer
          const buffer = await event.data.arrayBuffer();
          message = new Uint8Array(buffer);
        } catch (err) {
          console.error("Client B: Failed to convert Blob to ArrayBuffer", err);
          return;
        }
      } else {
        console.error("Client B: Received unknown data type:", typeof event.data);
        return;
      }
      // --- END OF FIX ---

      if (message.length === 0) {
        console.log("Client B: Message was empty after conversion, ignoring.");
        return;
      }

      console.log(`Client B: Converted to Uint8Array. Size: ${message.length}`);

      const decoder = decoding.createDecoder(message);
      console.log('Client B: Decoder created. Has content:', decoding.hasContent(decoder));

      // Loop while there is still content in the decoder
      while (decoding.hasContent(decoder)) {
        console.log('Client B: ...in while loop...');
        
        try {
          const messageType = decoding.readVarUint(decoder);
          console.log('Client B: Read messageType:', messageType, '(0=Sync, 1=Awareness)');

          switch (messageType) {
            case MESSAGE_SYNC: // 0
              console.log('Client B: Matched MESSAGE_SYNC (0)');
              const syncEncoder = encoding.createEncoder();
              encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
              syncProtocol.readSyncMessage(decoder, syncEncoder, ydoc, 'server');

              if (encoding.length(syncEncoder) > 1) {
                ws.send(encoding.toUint8Array(syncEncoder));
              }
              break;
              
            case MESSAGE_AWARENESS: // 1
              console.log('Client B: Matched MESSAGE_AWARENESS (1)');
              awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), 'server');
              break;
              
            default:
              console.error('Client B: HIT DEFAULT CASE! Unknown message type:', messageType);
              return; 
          }
        } catch (err) {
            console.error('--- CLIENT B: FAILED TO PROCESS MESSAGE ---', err);
            return;
        }
      }
      console.log('Client B: ...exited while loop clean...');
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      connected = false;
    };
    
    // --- Y.js Document Event Handler ---
    const onYDocUpdate = (update: Uint8Array, origin: any) => {
      console.log("onYDocUpdate called with origin:", origin);
      
      // --- THE FIX ---
      // We check the 'origin' argument.
      // If the origin is 'server', this update came from another
      // client, so we DON'T send it back to the server.
      if (origin !== 'server') {
        // This log will only appear on the client that is TYPING
        console.log('Client: Sending local update of size', update.byteLength);
        if (!connected) return;

        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.writeUpdate(encoder, update);
        ws.send(encoding.toUint8Array(encoder));
      }

      // --- THE DEBUGGING LOG ---
      // This log will run on ALL clients (A and B) every time
      // the document changes, no matter the origin.
      console.log(
        `Client: 'ydoc' was updated. Origin: [${origin}]. Content: "${ytext.toString()}"`
      );
    };
    ydoc.on('update', onYDocUpdate);

    // --- CodeMirror Setup ---
    const collaborationPlugin = yCollab(ytext, awareness, { undoManager });
    const extensions = [
        langExtension(language),
        collaborationPlugin,
        EditorView.theme({
            "&": {
              backgroundColor: "#0d1117",
              color: "#c9d1d9",
              height: "100%",
            },
            ".cm-gutters": {
              backgroundColor: "#0d1117",
              color: "#8b949e",
              border: "none"
            },
            ".cm-content": {
              caretColor: "#c9d1d9",
            },
        })
    ];
    setEditorExtensions(extensions);

    // --- Cleanup Function ---
    return () => {
      console.log("Cleanup function running: closing WebSocket.");
      // Reset the ref to allow Strict Mode remount to work
      didInit.current = false; 
      ydoc.off('update', onYDocUpdate);
      ws.close();
      ydoc.destroy();
    };
  }, [docId, language, user]); // Add `user` to the dependency array

  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        <CodeMirror 
            height="100%" 
            extensions={editorExtensions} 
        />
      </Suspense>
    </div>
  );
}