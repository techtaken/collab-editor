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

//TODO
// const WS_URL = import.meta.env.REACT_APP_WS_URL ?? window.location.origin;
const WS_URL = "http://192.168.1.26:3333"


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
};

export default function CodeEditor({ value, onChange, language }: Props) {
  //TODO
  // const { id: docId } = useParams<{ id?: string }>();
  const docId = "11150cda-9f19-495b-98f9-569cc821b055"
  const socketRef = useRef<Socket | null>(null);
  const applyingRemoteRef = useRef(false);
  const emitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // only connect if there's a docId (room) — still works if undefined but fine to guard
    // const socket = io(WS_URL);
    const socket = io(WS_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection failed:", err.message);
    });

    socketRef.current = socket;
    console.log("Socket connected:", socket.id, WS_URL);
    console.log("useEffect called with docId:", docId);
    
    

    if (docId) {
      socket.emit("join-room", docId);
    }

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

    return () => {
      if (docId) socket.emit("leave-room", docId);
      socket.disconnect();
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
