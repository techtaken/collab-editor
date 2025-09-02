// src/lib/api.ts
const API_BASE = import.meta.env.REACT_APP_BE_URL ?? "";

async function fetchJSON(input: string, init?: RequestInit) {
  const res = await fetch(API_BASE + input, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  listDocs: () => fetchJSON("/api/documents"),
  createDoc: (title: string, language?: string) =>
    fetchJSON("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title, language }),
    }),
  getDoc: (id: string) => fetchJSON(`/api/documents/${id}`),
  getDocContent: (id: string) => fetchJSON(`/api/documents/${id}/content`),
  saveDocContent: (id: string, content: string) =>
    fetchJSON(`/api/documents/${id}/content`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  createShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "POST" }),
  revokeShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "DELETE" }),
  // membership endpoints can be added similarly
};
