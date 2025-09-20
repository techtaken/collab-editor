import React from "react";
import { FilePlus } from "lucide-react";

export default function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="border border-dashed border-[var(--border)] rounded-lg p-12 bg-white text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <FilePlus size={24} />
      </div>
      <h3 className="text-lg font-medium">Create your first document</h3>
      <p className="text-sm text-gray-600 mt-1">Collaborate in real-time with your team.</p>
      <button
        className="mt-4 inline-flex items-center h-10 px-4 rounded-md bg-[var(--accent)] text-white text-sm hover:brightness-95 transition"
        onClick={onNew}
      >
        New Document
      </button>
    </div>
  );
}
