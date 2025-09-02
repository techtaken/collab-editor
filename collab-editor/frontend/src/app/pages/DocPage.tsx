// src/pages/DocPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import EditorShell from "../components/EditorShell";
import { api } from "../api/api";

export default function DocPage() {
  const { id } = useParams<{ id?: string }>();
  const [meta, setMeta] = useState<any | null>(null);
  const [content, setContent] = useState<string>("");

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

  return <Layout>{meta ? <EditorShell docMeta={meta} initialContent={content} /> : <div>Loading…</div>}</Layout>;
}
