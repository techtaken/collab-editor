// src/components/CodeEditor.tsx
import React, { Suspense, useEffect, useRef } from "react";
const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import { DefaultEventsMap } from "@socket.io/component-emitter";


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
  value: string;
  onChange: (v: string) => void;
  language: string;
  webSocket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
};

export default function CodeEditor({ value, onChange, language, webSocket }: Props) {
  //TODO
  // const { id: docId } = useParams<{ id?: string }>();
  const docId = "11150cda-9f19-495b-98f9-569cc821b055"
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(webSocket);
  const applyingRemoteRef = useRef(false);
  const emitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    
    console.log("useEffect called with docId:", docId);
    const socket = socketRef.current;
    
    if (docId && socket) {
      socket.emit("join-room", docId);
    }

    if (socket) {
      socket.on("remote-code-change", (data: { code: string }) => {
        const code = data?.code;
        if (typeof code !== "string") return;
        console.log(" inside remote-code-change:", code);

        // avoid echoing the incoming change
        applyingRemoteRef.current = true;
        try {
          onChange(code);
        } finally {
          // small timeout to allow editor internal events to settle
          window.setTimeout(() => {
            applyingRemoteRef.current = false;
          }, 50);
        }
      });
    }

    return () => {
      if (docId && socketRef.current) socketRef.current.emit("leave-room", docId);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
  }, [docId, value]);

  // local change handler: debounce and emit
  const handleChange = (v: string) => {
    console.log("Local change:", v);
    
    // if this change was caused by a remote update, don't emit
    if (applyingRemoteRef.current) return;
    if (!docId) return;

    if (emitTimeoutRef.current) {
      window.clearTimeout(emitTimeoutRef.current);
    }
    emitTimeoutRef.current = window.setTimeout(() => {

      socketRef.current?.emit("code-change", { roomId: docId, code: v });
      emitTimeoutRef.current = null;
    }, 120);

    // propagate locally as well
    onChange(v);
  };

  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        {/* @ts-ignore */}
        <CodeMirror
          value={value}
          height="100%"
          extensions={[langExtension(language)]}
          onChange={(value: string) => handleChange(value)}
          theme="dark"
        />
      </Suspense>
    </div>
  );
}
