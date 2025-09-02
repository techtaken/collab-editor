// src/components/Sidebar.tsx
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { docsState } from "../state/atoms";
import DocCard from "./DocCard";
import NewDocModal from "./NewDocModal";
import { useDocsLoader } from "../hooks/useDocs";

export default function Sidebar() {
  useDocsLoader();
  const docs = useRecoilValue(docsState);
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-72 border-r border-white/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents</h3>
        <button onClick={() => setOpen(true)} className="text-sm bg-indigo-600 px-3 py-1 rounded shadow">
          New
        </button>
        <NewDocModal open={open} onClose={() => setOpen(false)} />
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {docs.length === 0 ? <div className="text-sm text-muted">No documents yet — create one.</div> : docs.map((d) => <DocCard key={d.id} doc={d} />)}
      </div>

      <div className="text-xs text-muted">Signed in as demo user</div>
    </aside>
  );
}
