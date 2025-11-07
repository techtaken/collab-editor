import { getRecoil } from "recoil-nexus";
import { userAtom } from "../state/userAtom";

//TODO
// const API_BASE = import.meta.env.REACT_APP_BE_API_URL ?? 'http://localhost:3333';
const API_BASE = import.meta.env.REACT_APP_BE_URL ?? "http://192.168.1.34:3333";

// Simple error popup function
function showErrorPopup(message: string) {
  // Create popup container
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#e94560";
  popup.style.color = "#fff";
  popup.style.padding = "16px 32px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  popup.style.zIndex = "9999";
  popup.style.fontSize = "16px";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3500);
}

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
    showErrorPopup(text || res.statusText); // <-- replaced alert with popup
    if (res.status === 401) {
      // Auto logout on 401
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
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
  updateDocMeta: (id: string, meta: { language?: string; visibility?: string; title?: string }) =>
    fetchJSON(`/api/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(meta),
    }),
  createShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "POST" }),
  revokeShareToken: (id: string) => fetchJSON(`/api/documents/${id}/share/token`, { method: "DELETE" }),

  // Membership endpoints (refer to backend /api/documents/:id/members)
  getMembers: (docId: string) => fetchJSON(`/api/documents/${docId}/members`),
  addMembers: (docId: string, emails: string[], role: "READ" | "WRITE" = "READ") =>
    fetchJSON(`/api/documents/${docId}/members`, {
      method: "POST",
      body: JSON.stringify({ email: emails, role }),
    }),
  updateMemberRole: (docId: string, userId: string, role: "READ" | "WRITE") =>
    fetchJSON(`/api/documents/${docId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (docId: string, userId: string) =>
    fetchJSON(`/api/documents/${docId}/members/${userId}`, {
      method: "DELETE",
    }),

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
