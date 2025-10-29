// src/components/EditorShell.tsx
import React, { useState } from "react";
// import CodeEditor from "./CodeEditor";
import LanguageSwitch from "./LanguageSwitch";
import ShareButton from "./ShareButton";
import CollaboratorsList from "./CollaboratorsList";
import { api } from "../api/api";
import CodeEditorYjs from "./CodeEditorYjs";

export default function EditorShell({ docMeta, initialContent }: { docMeta: any; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(docMeta.language || "typescript");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.saveDocContent(docMeta.id, content);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-[80vh] rounded card overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <div className="font-medium">{docMeta.title}</div>
        <LanguageSwitch value={language} onChange={(l) => setLanguage(l)} />
        <ShareButton docId={docMeta.id} />
        <div className="ml-auto flex items-center gap-2">
          <CollaboratorsList docId={docMeta.id} />
          <button onClick={save} className="px-3 py-1 rounded bg-indigo-600">Save{saving ? "…" : ""}</button>
        </div>
      </div>

      <div className="flex-1">
        {/* <CodeEditorYjs value={content} onChange={setContent} language={language} /> */}
        <CodeEditorYjs language={language} />
      </div>
    </div>
  );
}
