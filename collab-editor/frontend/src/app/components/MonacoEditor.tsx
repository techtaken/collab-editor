import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const MonacoEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  const getCodeValue = () => {
    const value = editorRef.current?.getValue();
    alert(value);
  };

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// Type your code here..."
        theme="vs-dark"
        onMount={handleEditorDidMount}
      />
      <button onClick={getCodeValue}>Get Code</button>
    </div>
  );
};

export default MonacoEditor;
