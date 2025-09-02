// src/components/ShareButton.tsx
import React, { useState } from "react";
import { api } from "../api/api";

export default function ShareButton({ docId }: { docId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await api.createShareToken(docId);
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      setLink(`${origin}/doc/${docId}?token=${res.token}`);
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    try {
      await api.revokeShareToken(docId);
      setLink(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {link ? (
        <>
          <input readOnly value={link} className="bg-black/10 text-xs p-1 rounded w-[320px]" />
          <button onClick={revoke} className="px-2 py-1 rounded bg-red-600 text-sm">
            Revoke
          </button>
        </>
      ) : (
        <button onClick={create} disabled={busy} className="px-2 py-1 rounded bg-indigo-600 text-sm">
          {busy ? "…" : "Share"}
        </button>
      )}
    </div>
  );
}
