// src/components/CodeEditorYjs.tsx

import { Extension } from "@uiw/react-codemirror";
import React, { Suspense, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";

const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

type Props = {
  editorExtensions: Extension[];
};

// Helper to find Y.Text nested in extensions
function findYText(obj: any, seen = new Set(), depth = 0): Y.Text | null {
  if (!obj || depth > 6 || seen.has(obj)) return null;
  seen.add(obj);

  if (obj instanceof Y.Text) return obj;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findYText(item, seen, depth + 1);
      if (found) return found;
    }
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      try {
        const val = (obj as any)[key];
        if (val instanceof Y.Text) return val;
        const found = findYText(val, seen, depth + 1);
        if (found) return found;
      } catch {
        // ignore property access errors
      }
    }
  }

  return null;
}

export default function CodeEditorYjs({ editorExtensions }: Props) {
  // Extract Y.Text from extensions (embedded by y-collab)
  const ytext = useMemo(() => findYText(editorExtensions), [editorExtensions]);

  // Local value for CodeMirror (independent from parent state)
  const [value, setValue] = useState<string>(() => {
    if (ytext) {
        return ytext.toString();
    }
    return "";
  });

  const isInitializedRef = React.useRef(false);

  // Subscribe to Y.Text updates (from remote/provider)
  useEffect(() => {
    if (!ytext) {
      console.warn("⚠️ CodeEditorYjs: Y.Text NOT found in extensions");
      setValue("");
      return;
    }

    console.log("🔍 CodeEditorYjs: Y.Text found");

    // Initialize value from Y.Text on first mount
    if (!isInitializedRef.current) {
      const ytextContent = ytext.toString();
      console.log("📝 First mount, Y.Text content:", ytextContent.slice(0, 50));
     
      console.log("📥 Y.Text already has content, using it:", ytextContent.slice(0, 50));
      setValue(ytextContent);
      
      isInitializedRef.current = true;
     }

    // Listen for remote updates (changes from other users or provider sync)
    const handleYTextUpdate = () => {
      const updated = ytext.toString();
      setValue(updated);
      console.log("📤 Y.Text updated (remote):", updated.slice(0, 50));
    };

    ytext.observe(handleYTextUpdate);
    return () => {
      try {
        ytext.unobserve(handleYTextUpdate);
      } catch {}
    };
  }, [ytext]);

  // Handle local editor changes
  // Note: y-collab plugin handles inserting changes into Y.Text,
  // so we just need to update local state for UI responsiveness
  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  return (
    <div className="h-full">
      <Suspense fallback={<div className="p-4">Loading editor…</div>}>
        <CodeMirror
          height="100%"
          extensions={editorExtensions}
          value={value ?? ""}
          onChange={handleChange}
          basicSetup={true}
        />
      </Suspense>
    </div>
  );
}