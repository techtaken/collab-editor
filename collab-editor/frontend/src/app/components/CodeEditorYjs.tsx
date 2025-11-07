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
import { EditorView } from "@codemirror/view";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";

// 1. ADD the new Socket.IO Provider import
import { SocketIOProvider } from "y-socket.io"; // Note: /client import

// 2. REMOVE all manual protocol/encoding/decoding imports
// import * as awarenessProtocol from 'y-protocols/awareness';
// import * as syncProtocol from 'y-protocols/sync';
// import * as encoding from 'lib0/encoding';
// import * as decoding from 'lib0/decoding';

// 3. UPDATE WS_URL: socket.io connects over HTTP/S, not WS://
const WS_URL = import.meta.env.REACT_APP_WS_URL ?? "http://192.168.1.3:3333";

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

// 4. REMOVE message constants
// const MESSAGE_SYNC = 0;
// const MESSAGE_AWARENESS = 1;

// ... (langExtension function is the same) ...

export default function CodeEditorYjs({ language }: Props) {
  const [editorExtensions, setEditorExtensions] = useState<any[]>([]);
  const docId = "11150cda-9f19-495b-98f9-569cc821b055";
  // 5. REMOVE the didInit ref
  // const didInit = useRef(false);
  const user = useRecoilValue(userAtom) ;

  useEffect(() => {
    console.log("docId", docId);

    // 6. We still wait for the token
    if (!docId || !user?.token) {
        console.log("Waiting for user token...");
        return;
    }

    // 7. REMOVE the didInit guard
    // if (didInit.current) return;
    // didInit.current = true;
    
    // --- Y.js Setup ---
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(ytext);

    // 8. --- THIS REPLACES ALL NETWORKING LOGIC ---
    // The provider handles connecting, auth, blobs, batching, and reconnects.
    const provider = new SocketIOProvider(
      WS_URL,
      docId,
      ydoc,
      {
        // We pass our token here, which the server's
        // `checkPermission` function will receive.
        auth: { token: user.token }
      }
    );

    // We get the awareness instance *from* the provider
    const awareness = provider.awareness;
    // ------------------------------------------------

    // 9. REMOVE all ws.onopen, ws.onmessage, ws.onclose handlers
    // 10. REMOVE the onYDocUpdate function

    // --- CodeMirror Setup ---
    // The yCollab binding is exactly the same
    const collaborationPlugin = yCollab(ytext, awareness, { undoManager });
    const extensions = [
        langExtension(language),
        collaborationPlugin,
        EditorView.theme({ /* ... your theme ... */ })
    ];
    setEditorExtensions(extensions);

    // --- Cleanup Function ---
    return () => {
      console.log("Cleanup function running: disconnecting provider.");
      // 11. REMOVE all the old cleanup logic
      // 12. Just disconnect the provider and destroy the doc
      provider.disconnect();
      ydoc.destroy();
    };
  }, [docId, language, user]); // Dependencies are the same

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