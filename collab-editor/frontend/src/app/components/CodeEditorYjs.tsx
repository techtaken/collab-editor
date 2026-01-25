// src/components/CodeEditorYjs.tsx

import { Extension } from "@uiw/react-codemirror";
import React, { Suspense } from "react";
const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

type Props = {
  editorExtensions: Extension[];
  value?: string;
};

export default function CodeEditorYjs({ editorExtensions, value }: Props) {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        <CodeMirror
          height="100%"
          extensions={editorExtensions}
          // provide initial doc so CM and y-collab are aligned on mount
          value={value ?? ""}
          basicSetup={false}
        />
      </Suspense>
    </div>
  );
}