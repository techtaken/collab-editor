import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";
import RegisterUser from "./RegisterUser";

const MonacoEditor: React.FC = () => {
  const user = useRecoilValue(userAtom);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  const saveCodeValue = async () => {
    const value = editorRef.current?.getValue();
  
    if (!value) {
      alert("No code to save!");
      return;
    }
  
    try {
      const response = await fetch('/api/save-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user?.name, // Assuming `user` has a `username` property
          code: value,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert("Code saved successfully!");
        console.log("Response:", data);
      } else {
        const error = await response.json();
        alert(`Failed to save code: ${error.error}`);
      }
    } catch (err) {
      console.error("Error saving code:", err);
      alert("An error occurred while saving the code.");
    }
  };

  useEffect(() => {
    console.log("user ", user);
  }, [editorRef, user]);

  if (!user) {
    return <RegisterUser />;
  }

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// Type your code here..."
        theme="vs-dark"
        onMount={handleEditorDidMount}
      />
      <button onClick={saveCodeValue}>Save Code</button>
    </div>
  );
};

export default MonacoEditor;
