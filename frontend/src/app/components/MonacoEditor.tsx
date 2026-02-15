import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";

const WS_URL = import.meta.env.VITE_WS_URL ?? window.location.origin;

const MonacoEditor: React.FC = () => {
  const { id: docId } = useParams<{ id?: string }>();
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const applyingRemoteRef = useRef(false);
  const emitTimeoutRef = useRef<number | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // optionally set initial value if you fetch document from server
  };

  useEffect(() => {
    // connect socket
    const socket = io(WS_URL);
    socketRef.current = socket;

    // join document room if available
    if (docId) {
      socket.emit("join-room", docId);
    }

    socket.on("remote-code-change", (data: { code: string }) => {
      const code = data?.code;
      if (typeof code !== "string") return;
      const editor = editorRef.current;
      if (!editor) return;

      // apply remote without re-emitting
      applyingRemoteRef.current = true;
      const model = editor.getModel();
      if (model) {
        const fullRange = model.getFullModelRange();
        editor.executeEdits("remote", [
          {
            range: fullRange,
            text: code,
            forceMoveMarkers: true,
          },
        ]);
      } else {
        editor.setValue(code);
      }

      // small delay before allowing local edits to emit again
      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 50);
    });

    return () => {
      if (docId) socket.emit("leave-room", docId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [docId]);

  // debounce and emit changes
  const handleChange = (value?: string) => {
    if (applyingRemoteRef.current) return;
    if (!docId) return;
    const payload = { roomId: docId, code: value ?? "" };

    if (emitTimeoutRef.current) {
      window.clearTimeout(emitTimeoutRef.current);
    }
    emitTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit("code-change", payload);
    }, 150);
  };

  const saveCodeValue = () => {
    const value = editorRef.current?.getValue();
    alert(value);
  };

  return (
    <div style={{ height: "100vh" }}>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// Type your code here..."
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={handleChange}
      />
      <button onClick={saveCodeValue}>Save Code</button>
    </div>
  );
};

export default MonacoEditor;