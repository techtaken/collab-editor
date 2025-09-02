// src/components/DocCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { DocMeta } from "../state/atoms";

export default function DocCard({ doc }: { doc: DocMeta }) {
  return (
    <Link to={`/doc/${doc.id}`} className="block">
      <div className="card hover:ring-1 hover:ring-indigo-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{doc.title}</div>
            <div className="text-xs text-muted">{doc.language ?? "plaintext"}</div>
          </div>
          <div className="text-[12px] text-muted">{doc.visibility?.toLowerCase()}</div>
        </div>
      </div>
    </Link>
  );
}
