// src/components/NewDocModal.tsx
import React, { useState } from "react";
import { api } from "../api/api";
import { useSetRecoilState } from "recoil";
import { docsState } from "../state/atoms";

export default function NewDocModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [lang, setLang] = useState("typescript");
  const setDocs = useSetRecoilState(docsState);

  if (!open) return null;

  const create = async () => {
    const doc = await api.createDoc(title || "Untitled", lang);
    setDocs((prev) => [doc, ...prev]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="card z-10 w-[420px] p-4">
        <h3 className="text-lg font-semibold mb-2">Create new document</h3>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full mb-2 p-2 rounded bg-black/20" />
        <select className="w-full mb-4 p-2 rounded bg-black/20" value={lang} onChange={(e)=>setLang(e.target.value)}>
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded">Cancel</button>
          <button onClick={create} className="px-3 py-1 rounded bg-indigo-600 text-white">Create</button>
        </div>
      </div>
    </div>
  );
}
