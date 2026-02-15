import React, { useState } from "react";
import { Bell, Menu, Plus, ChevronRight } from "lucide-react";

type Crumb = { label: string; to?: string };
export default function TopBar({
  onToggleSidebar,
  breadcrumb = [{ label: "Dashboard" }],
  onNewDoc,
}: {
  onToggleSidebar: () => void;
  breadcrumb?: Crumb[];
  onNewDoc: () => void;
}) {
  const [query, setQuery] = useState("");
  // const avatarName = user?.name?.trim() ? encodeURIComponent(user.name) : "User";
  // const avatarSrc = `https://ui-avatars.com/api/?name=${avatarName}&background=0b1020&color=fff&rounded=true&size=64`;


  return (
    <header
      className="fixed top-0 inset-x-0 h-16 bg-white shadow-sm border-b border-[var(--border)] z-40"
      role="banner"
    >
      <div className="h-full flex items-center gap-3 px-4">
        {/* Sidebar toggle */}
        <button
          className="icon-btn"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center text-[13px] text-gray-600"
        >
          {breadcrumb.map((c, idx) => (
            <div key={idx} className="flex items-center">
              <span className={idx === breadcrumb.length - 1 ? "font-medium text-gray-900" : ""}>
                {c.label}
              </span>
              {idx < breadcrumb.length - 1 && <ChevronRight className="mx-2" size={16} aria-hidden />}
            </div>
          ))}
        </nav>

        {/* Center search */}
        <div className="flex-1 flex justify-center px-2">
          <label className="relative w-full max-w-xl" aria-label="Search documents">
            <input
              value={query}
              onChange={(e) => {setQuery(e.target.value);console.log(query);
              }}
              placeholder="Search documents..."
              className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-4 text-sm placeholder:text-gray-400 focus:bg-white transition"
            />
            {/* Live search event for parent listeners */}
            {/* <input
              type="hidden"
              value={query}
              onChange={() => {}}
              data-testid="search-proxy"
            /> */}
          </label>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button
            onClick={onNewDoc}
            className="inline-flex items-center h-10 px-3 rounded-md bg-[var(--accent)] text-white text-sm hover:brightness-95 transition"
          >
            <Plus className="mr-1" size={16} />
            New
          </button>
          {/* Avatar */}
          {/* <button
            className="h-10 w-10 rounded-full border border-[var(--border)] overflow-hidden"
            aria-label="User menu"
          >
            <img
              src="https://ui-avatars.com/api/?name=JD&background=6366f1&color=fff"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </button> */}
        </div>
      </div>
    </header>
  );
}
