// src/components/EditorShell.tsx
import React, { useState, useRef } from "react";
import LanguageSwitch from "./LanguageSwitch";
import CollaboratorsList from "./CollaboratorsList";
import SharePopup from "./SharePopup";
import { api } from "../api/api";
import CodeEditorYjs from "./CodeEditorYjs";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";
// ADD the new Socket.IO Provider import
import { SocketIOProvider } from "y-socket.io"; 
import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView } from "@codemirror/view";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";

const WS_URL = import.meta.env.VITE_WS_URL ?? window.location.origin;

export default function EditorShell({ docMeta, initialContent }: { docMeta: any; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(docMeta.language || "typescript");
  const [visibility, setVisibility] = useState(docMeta.visibility || "PRIVATE");
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Title editing state
  const [title, setTitle] = useState(docMeta.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const user = useRecoilValue(userAtom);
  const docId = docMeta.id;

  const [editorExtensions, setEditorExtensions] = useState<any[]>([]);

  // keep provider/awareness so other components (CollaboratorsList) can consume
  const providerRef = useRef<any | null>(null);
  const [awareness, setAwareness] = useState<any | null>(null);

  function langExtension(lang: string) {
    switch (lang) {
      case "javascript":
        return javascript({ jsx: true });
      case "typescript":
        return javascript({ typescript: true });
      case "python":
        return python();
      case "java":
        return java();
      case "html":
        return html();
      case "json":
        return json();
      default:
        return javascript();
    }
  }

  // Handle click outside for title save
  React.useEffect(() => {
    //editing title on click
    function handleClickOutside(event: MouseEvent) {
      if (
        editingTitle &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        saveTitle();
      }
    }
    if (editingTitle) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, [editingTitle, title]);

  React.useEffect(() => {
      console.log("docId", docId);

      // wait for doc id and user token
      if (!docId || !user?.token) {
          console.log("Waiting for user token...");
          return;
      }
      
      // --- Y.js Setup ---
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText("codemirror");
      const undoManager = new Y.UndoManager(ytext);
  
      // The provider handles connecting, auth, blobs, batching, and reconnects.
      const provider = new SocketIOProvider(
        WS_URL,
        docId,
        ydoc,
        {
          // pass token for server auth
          auth: { token: user.token }
        }
      );
  
      // expose awareness for collaborators list
      providerRef.current = provider;
      setAwareness(provider.awareness);
  
      // awareness is used by CodeMirror y-collab too
      const awareness = provider.awareness;
    
      const collaborationPlugin = yCollab(ytext, awareness, { undoManager });
      const extensions = [
          langExtension(language),
          collaborationPlugin,
          EditorView.theme({ /* ... your theme ... */ })
      ];
      setEditorExtensions(extensions);
  
      // --- Cleanup Function ---
      return () => {
        console.log("Cleanup function running: disconnecting provider.");
        provider.disconnect();
        ydoc.destroy();
        providerRef.current = null;
        setAwareness(null);
      };
    }, [docId, language, user]); 
  

  async function save() {
    setSaving(true);
    try {
      await api.saveDocContent(docMeta.id, content);
    } finally {
      setSaving(false);
    }
  }

  async function handleLanguageChange(l: string) {
    setLanguage(l);
    await api.updateDocMeta(docMeta.id, { language: l });
  }

  async function handleVisibilityToggle() {
    const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setVisibility(newVisibility);
    await api.updateDocMeta(docMeta.id, { visibility: newVisibility });
  }

  async function saveTitle() {
    if (title !== docMeta.title && title.trim().length > 0) {
      await api.updateDocMeta(docMeta.id, { title });
      docMeta.title = title; // update local meta so next edit is correct
    }
    setEditingTitle(false);
  }

  // Handler to get share link and show popup
  async function handleShowShare() {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setShareLink(`${origin}/doc/${docMeta.id}`);
    setShowShare(true);
  }

  return (
    <div className="h-[80vh] rounded card overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        {/* Editable Title */}
        <div className="font-medium" style={{ minWidth: 0 }}>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  saveTitle();
                }
              }}
              className="border-b border-indigo-400 bg-transparent outline-none px-1 py-0.5 text-base font-medium"
              autoFocus
              style={{ minWidth: 120, maxWidth: 300 }}
            />
          ) : (
            <span
              className="cursor-pointer truncate block max-w-xs"
              title={title}
              onClick={() => setEditingTitle(true)}
            >
              {title}
            </span>
          )}
        </div>
        <LanguageSwitch value={language} onChange={handleLanguageChange} />
        {/* Share Button */}
        <button
          onClick={handleShowShare}
          className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Share
        </button>
        {showShare && shareLink && (
          <SharePopup
            docId={docMeta.id}
            visibility={visibility}
            onClose={() => setShowShare(false)}
            shareLink={shareLink}
          />
        )}
        {/* Visibility Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVisibilityToggle}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
              visibility === "PUBLIC" ? "bg-green-500" : "bg-gray-400"
            }`}
            aria-pressed={visibility === "PUBLIC"}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                visibility === "PUBLIC" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm ml-1">{visibility}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* pass awareness (from SocketIOProvider) so CollaboratorsList can read live presence */}
          <CollaboratorsList docId={docMeta.id} awareness={awareness} />
        </div>
      </div>

      <div className="flex-1">
        <CodeEditorYjs editorExtensions={editorExtensions} />
      </div>
      
    </div>
  );
}
