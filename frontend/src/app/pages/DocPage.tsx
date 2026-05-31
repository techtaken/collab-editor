// src/pages/DocPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import EditorShell from "../components/EditorShell";
import AIAssistant from "../components/AIAssistant";
import { api } from "../api/api";

export default function DocPage() {
  const { id } = useParams<{ id?: string }>();
  const [meta, setMeta] = useState<any | null>(null);
  const [content, setContent] = useState<string>("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    Promise.all([api.getDoc(id), api.getDocContent(id)])
      .then(([m, c]) => {
        if (!mounted) return;
        setMeta(m);
        setContent(c?.content ?? "");
      })
      .catch((e) => console.error(e));
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Layout>
      {meta ? <EditorShell docMeta={meta} initialContent={content} onToggleAIAssistant={() => setAiAssistantOpen(!aiAssistantOpen)} /> : <div>Loading…</div>}
      {meta && id && (
        <AIAssistant
          documentId={id}
          isOpen={aiAssistantOpen}
          onToggle={() => setAiAssistantOpen(!aiAssistantOpen)}
        />
      )} 
    </Layout>
  );
}
