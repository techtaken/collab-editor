import React, { useEffect, useRef,useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";
import RegisterUser from "./RegisterUser";
import { useLocation } from 'react-router-dom';
import { saveCode, getCode } from "../api/codeApi"; 

const API_URL = 'http://localhost:3333/api';

const MonacoEditor: React.FC = () => {
  const location = useLocation();
  const collabCode = new URLSearchParams(location.search).get('collabCode');

  const user = useRecoilValue(userAtom);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [savedCode, setSavedCode] = useState('// Type your code here...');


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
      const data = await saveCode(user.name, value);
      alert("Code saved successfully!");
      console.log("Response:", data);
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  const fetchSavedCode = async () => {
    if (!user?.name) return;

    try {
      const response = await fetch(API_URL+ `/get-code/${user.name}`);
      if (response.ok) {
        const data = await response.json();
        setSavedCode(data?.data?.code || '// Type your code here...');
      } else {
        console.error('Failed to fetch saved code:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching saved code:', error);
    }
  };

  useEffect(() => {
    console.log("user ", user);
    fetchSavedCode();
  }, [editorRef, user]);

  if (!user) {
    return <RegisterUser />;
  }

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        value={savedCode}
        theme="vs-dark"
        onMount={handleEditorDidMount}
      />
      <button onClick={saveCodeValue}>Save Code</button>
    </div>
  );
};

export default MonacoEditor;
