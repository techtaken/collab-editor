// src/components/CodeEditor.tsx
import React, { Suspense } from "react";
const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";

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

export default function CodeEditor({ value, onChange, language }: { value: string; onChange: (v: string) => void; language: string }) {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        {/* @ts-ignore */}
        <CodeMirror
          value={value}
          height="100%"
          extensions={[langExtension(language)]}
          onChange={(value: string) => onChange(value)}
          theme="dark"
        />
      </Suspense>
    </div>
  );
}
