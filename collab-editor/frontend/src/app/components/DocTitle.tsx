import React, { useEffect, useRef, useState } from "react";

type DocTitleProps = {
  value: string;
  onSave: (newTitle: string) => Promise<void> | void;
  className?: string;
};

export default function DocTitle({ value, onSave, className }: DocTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (editing && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        finishEdit();
      }
    }
    if (editing) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line
  }, [editing, draft]);

  async function finishEdit() {
    if (!editing) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      try {
        setBusy(true);
        await onSave(trimmed);
      } catch (err) {
        console.error("Failed to save title", err);
      } finally {
        setBusy(false);
      }
    }
    setEditing(false);
  }

  return (
    <div className={className}>
      {editing ? (
        <input
          ref={inputRef}
          className="border-b border-indigo-400 bg-transparent outline-none px-1 py-0.5 text-base font-medium"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishEdit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer truncate block max-w-xs"
          title={value}
          onClick={() => setEditing(true)}
        >
          {value}
        </span>
      )}
      {busy && <span className="ml-2 text-xs text-gray-400">Saving…</span>}
    </div>
  );
}