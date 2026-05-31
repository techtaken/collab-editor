// // src/components/EditorShell.tsx
import React, { useState, useRef, useEffect } from "react";
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
import DocTitle from "./DocTitle";
import { Bot } from "lucide-react";

const WS_URL = import.meta.env.VITE_WS_URL ?? window.location.origin;

export default function EditorShell({ docMeta, initialContent, onToggleAIAssistant }: { docMeta: any; initialContent: string; onToggleAIAssistant?: () => void }) {
  const user = useRecoilValue(userAtom);
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState(docMeta.language || "typescript");
  const [visibility, setVisibility] = useState(docMeta.visibility || "PRIVATE");
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [title, setTitle] = useState(docMeta.title);

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

  // Title save handler used by DocTitle
  async function handleTitleSave(newTitle: string) {
    if (newTitle !== title && newTitle.trim().length > 0) {
      try {
        await api.updateDocMeta(docMeta.id, { title: newTitle });
        setTitle(newTitle);
        docMeta.title = newTitle;
      } catch (err) {
        console.error("Failed to save title:", err);
      }
    }
  }

  useEffect(() => {
    console.log("docId", docId);

    if (!docId || !user?.token) {
      console.log("Waiting for user token...");
      return;
    }

    // --- Y.js Setup ---
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("content");
    const undoManager = new Y.UndoManager(ytext);

    // Create provider
    const provider = new SocketIOProvider(
      WS_URL,
      docId,
      ydoc,
      { auth: { token: user.token } }
    );

    providerRef.current = provider;
    const awareness = provider.awareness;
    
    // Set local user in awareness so other users can see us
    console.log("👤 Setting awareness state for user:", user);
    awareness.setLocalState({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // random color for cursor
      }
    });

    setAwareness(awareness);

    const collaborationPlugin = yCollab(ytext, awareness, { undoManager });
    const extensions = [
      langExtension(language),
      collaborationPlugin,
      EditorView.theme({})
    ];
    setEditorExtensions(extensions);

    // Debug events
    provider.on('status', (event: any) => {
      console.log('🟡 [Yjs Status]:', event.status);
    });

    // provider.on('sync', (isSynced: boolean) => {
    //   console.log('🟢 [Yjs Synced]:', isSynced);
      
    //   if (isSynced) {
    //     // Seed initialContent only if Y.Text is empty and we haven't seeded yet
    //     // if (ytext.length === 0 && initialContent && !hasSeededRef.current) {
    //     //   console.log("📝 Seeding Y.Text (first time):", initialContent.slice(0, 50));
    //     //   ytext.insert(0, initialContent);
    //     //   hasSeededRef.current = true;
    //     // }
        
    //     const currentContent = ytext.toString();
    //     console.log("📥 Synced content:", currentContent.slice(0, 50));
    //     setContent(currentContent);
    //     setIsSynced(true); // ✅ Update state to trigger re-render
    //   }
    // });

    provider.socket.on("connect_error", (err: any) => {
      console.error("🔴 [Socket Auth Error]:", err.message);
    });

    // --- Cleanup ---
    return () => {
      console.log("Cleanup: disconnecting provider");
      provider.disconnect();
      ydoc.destroy();
      providerRef.current = null;
      setAwareness(null);
    };
  }, [docId, language, user, initialContent]);

  async function handleLanguageChange(l: string) {
    setLanguage(l);
    await api.updateDocMeta(docMeta.id, { language: l });
  }

  async function handleVisibilityToggle() {
    const newVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setVisibility(newVisibility);
    await api.updateDocMeta(docMeta.id, { visibility: newVisibility });
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
        {/* Document Title (extracted) */}
        <div className="font-medium" style={{ minWidth: 0 }}>
          <DocTitle value={title} onSave={handleTitleSave} />
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
        {/* AI Assistant Button */}
        {onToggleAIAssistant && (
          <button
            onClick={onToggleAIAssistant}
            className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1"
            title="Toggle AI Assistant"
          >
            <Bot size={16} />
            AI
          </button>
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
        {editorExtensions.length > 0 && (
          <CodeEditorYjs
            // key={docMeta.id}
            editorExtensions={editorExtensions}
          />
        )}
      </div>
    </div>
  );
}