import React from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ListGridToggle({ mode, onChange }: { mode: "grid" | "list"; onChange: (m: "grid" | "list") => void }) {
  return (
    <div className="inline-flex rounded-md border border-[var(--border)] bg-white">
      <button
        className={`px-3 h-9 inline-flex items-center gap-1 text-sm rounded-l-md ${mode === "grid" ? "bg-[var(--bg-subtle)]" : "hover:bg-gray-50"}`}
        onClick={() => onChange("grid")}
        aria-pressed={mode === "grid"}
      >
        <LayoutGrid size={16} /> Grid
      </button>
      <button
        className={`px-3 h-9 inline-flex items-center gap-1 text-sm rounded-r-md ${mode === "list" ? "bg-[var(--bg-subtle)]" : "hover:bg-gray-50"}`}
        onClick={() => onChange("list")}
        aria-pressed={mode === "list"}
      >
        <List size={16} /> List
      </button>
    </div>
  );
}
