import React, { useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const MonacoEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'xx@xx.com',
    name: 'xx',
    avatarUrl: 'https://via.placeholder.com/150',
    googleId: '123'
  });

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  

  const saveCodeValue = () => {
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
      <button onClick={saveCodeValue}>Save Code</button>
    </div>
  );
};

export default MonacoEditor;
