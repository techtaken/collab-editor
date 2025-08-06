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

  const saveCodeValue = () => {
    const value = editorRef.current?.getValue();
    alert(value);
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
