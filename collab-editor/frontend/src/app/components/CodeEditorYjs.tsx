// src/components/CodeEditorYjs.tsx

import { Extension } from "@uiw/react-codemirror";
import React, { Suspense, useEffect } from "react";
const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

type Props = {
  editorExtensions: Extension[];
};

export default function CodeEditorYjs({ editorExtensions }: Props) {

  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        <CodeMirror
          height="100%"
          extensions={editorExtensions}
          basicSetup={true}
        />
      </Suspense>
    </div>
  );
}