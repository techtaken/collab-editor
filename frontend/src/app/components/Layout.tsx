import React, { useState, ReactNode, useEffect } from "react";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";

type Props = { children: ReactNode; breadcrumb?: { label: string; to?: string }[] };

export default function Layout({ children, breadcrumb }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Collapse to icons at <= 1024px, slide-out on smaller
  useEffect(() => {
    const handler = () => setSidebarOpen(window.innerWidth >= 1024);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Top bar fixed */}
      <TopBar
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        breadcrumb={breadcrumb}
        // new document button callback stub (wire to real handler)
        onNewDoc={() => document.dispatchEvent(new CustomEvent("ui:new-doc"))}
      />
      <div className="h-[64px]" /> {/* spacer for fixed header */}

      <div className="flex h-[calc(100%-64px)]">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <main
          className={`flex-1 min-w-0 h-full overflow-y-auto bg-[var(--bg-subtle)] ${sidebarOpen ? 'ml-[250px]' : 'ml-5'}`}
          role="main"
          aria-label="Main content"
        >
          <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
