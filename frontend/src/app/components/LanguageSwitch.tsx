// src/components/LanguageSwitch.tsx
import React from "react";

const LANGS = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "html", label: "HTML" },
];

export default function LanguageSwitch({ value, onChange }: { value: string; onChange: (l: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-black/10 text-sm p-1 rounded">
      {LANGS.map((l) => (
        <option key={l.id} value={l.id}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
