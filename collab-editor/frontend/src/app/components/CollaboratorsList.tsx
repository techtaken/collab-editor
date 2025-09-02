// src/components/CollaboratorsList.tsx
import React, { useEffect, useState } from "react";

export default function CollaboratorsList({ docId }: { docId?: string }) {
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    if (!docId) return;
    // TODO: replace with API call: api.getMembers(docId)
    setMembers([{ name: "Alice" }, { name: "Bob" }]); // placeholder for now
  }, [docId]);

  return (
    <div className="flex items-center gap-2">
      {members.slice(0, 4).map((m, i) => (
        <div key={i} className="w-7 h-7 rounded-full bg-white/8 text-xs flex items-center justify-center">
          {m.name?.[0] ?? "U"}
        </div>
      ))}
    </div>
  );
}
