import { getRecoil } from "recoil-nexus";
import { userAtom } from "../state/userAtom";

const API_BASE = import.meta.env.REACT_APP_BE_URL ?? "http://localhost:3333";

async function fetchJSON(input: string, init?: RequestInit, useAuth = true) {
  console.log("API_BASE", API_BASE);

  // Get token from userAtom if useAuth is true
  let headers: Record<string, string> = { "Content-Type": "application/json", "x-user-id": "1" };
  if (useAuth) {
    const user = getRecoil(userAtom);
    if (user?.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
    }
  }

  const res = await fetch(API_BASE + input, {
    headers,
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
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
  createShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "POST" }),
  revokeShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "DELETE" }),
  // membership endpoints can be added similarly

  // --- login and register do NOT use Authorization header ---
  register: (email: string, username: string, password: string) =>
    fetchJSON("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    }, false),
  login: (email: string, password: string) =>
    fetchJSON("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),
};
