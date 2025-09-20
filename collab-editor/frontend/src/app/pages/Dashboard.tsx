import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import DocCard from "../components/DocCard";
import ListGridToggle from "../components/ListGridToggle";
import EmptyState from "../components/EmptyState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { docsState } from "../state/atoms";
import { api } from "../api/api";
import { useDocsLoader } from "../hooks/useDocs";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  useDocsLoader();
  const docs = useRecoilValue(docsState);
  const setDocs = useSetRecoilState(docsState);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  // Listen to TopBar search (very lightweight event bus)
  useEffect(() => {
    const inputSelector = 'input[placeholder="Search documents..."]';
    const listener = (e: Event) => {
      const el = document.querySelector<HTMLInputElement>(inputSelector);
      setFilter(el?.value || "");
    };
    document.addEventListener("input", listener);
    return () => document.removeEventListener("input", listener);
  }, []);

  // New document button global event
  useEffect(() => {
    const onNew = async () => {
      const title = prompt("Title");
      if (!title) return;
      const doc = await api.createDoc(title, "typescript");
      setDocs((prev) => [doc, ...prev]);
      navigate(`/doc/${doc.id}`);
    };
    const handler = () => onNew();
    document.addEventListener("ui:new-doc", handler as any);
    return () => document.removeEventListener("ui:new-doc", handler as any);
  }, [navigate, setDocs]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.title.toLowerCase().includes(q));
  }, [docs, filter]);

  return (
    <Layout breadcrumb={[{ label: "Dashboard" }]}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your Documents</h1>
        <ListGridToggle mode={mode} onChange={setMode} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState onNew={() => document.dispatchEvent(new CustomEvent("ui:new-doc"))} />
      ) : mode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DocCard
              key={d.id}
              name={d.title}
              updatedAt={d.updatedAt || new Date().toISOString()}
              language={d.language || "typescript"}
              collaborators={[{ name: "Alice" }, { name: "Bob" }, { name: "Chloe" }]}
              onOpen={() => navigate(`/doc/${d.id}`)}
              onMenu={() => {}}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DocCard
              key={d.id}
              name={d.title}
              updatedAt={d.updatedAt || new Date().toISOString()}
              language={d.language || "typescript"}
              collaborators={[{ name: "Alice" }, { name: "Bob" }, { name: "Chloe" }]}
              onOpen={() => navigate(`/doc/${d.id}`)}
              onMenu={() => {}}
              variant="list"
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
