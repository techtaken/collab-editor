// src/components/TopBar.tsx
import React from "react";

export default function TopBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-opacity-5">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow">
          Wa
        </div>
        <div>
          <div className="text-sm font-semibold">WorkAt.Collab (MVP)</div>
          <div className="text-xs text-muted text-[12px]">Real-time code editing — Phase 1</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="text-sm text-muted px-3 py-1 rounded hover:bg-white/3">Docs</button>
        <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-xs">JD</div>
      </div>
    </header>
  );
}
