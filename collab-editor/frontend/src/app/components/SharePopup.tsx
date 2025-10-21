import React, { useState } from "react";
import { api } from "../api/api";

type SharePopupProps = {
  docId: string;
  visibility: "PRIVATE" | "PUBLIC";
  onClose: () => void;
  shareLink: string;
};

export default function SharePopup({ docId, visibility, onClose, shareLink }: SharePopupProps) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [access, setAccess] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);

  // new states
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add or update email fields
  const handleEmailChange = (idx: number, value: string) => {
    const updated = [...emails];
    updated[idx] = value;
    setEmails(updated);
  };

  const addEmailField = () => setEmails([...emails, ""]);
  const removeEmailField = (idx: number) => setEmails(emails.filter((_, i) => i !== idx));

  // complete handleShare: use api.addMembers
  const handleShare = async () => {
    setError(null);
    setSuccess(null);

    const filtered = emails.map(e => e.trim()).filter(Boolean);
    if (filtered.length === 0) {
      setError("Please enter at least one email to share with.");
      return;
    }

    setBusy(true);
    try {
      const role = access === "view" ? "READ" : "WRITE";
      await api.addMembers(docId, filtered, role);
      setSuccess("Document shared successfully.");
      // optionally clear inputs
      setEmails([""]);
      // close after short delay so user sees success
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err?.message || "Failed to share document.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Share Document</h2>
        {visibility === "PRIVATE" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Add people</label>
            {emails.map((email, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => handleEmailChange(idx, e.target.value)}
                  placeholder="Enter email"
                  className="border px-2 py-1 rounded w-full"
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    className="ml-2 text-red-500"
                    onClick={() => removeEmailField(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 text-sm mt-1"
              onClick={addEmailField}
            >
              + Add another
            </button>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Access</label>
          <select
            value={access}
            onChange={e => setAccess(e.target.value as "view" | "edit")}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="view">Viewer</option>
            <option value="edit">Editor</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Share Link</label>
          <div className="flex items-center">
            <input
              readOnly
              value={shareLink}
              className="border px-2 py-1 rounded w-full text-xs"
            />
            <button
              type="button"
              className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* show error / success */}
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-3">{success}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
          {visibility === "PRIVATE" && (
            <button
              type="button"
              className={`px-4 py-2 rounded text-white ${busy ? "bg-indigo-400" : "bg-indigo-600"}`}
              onClick={handleShare}
              disabled={busy}
            >
              {busy ? "Sharing…" : "Share"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}