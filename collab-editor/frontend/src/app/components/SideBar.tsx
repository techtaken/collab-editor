import React from "react";
import {
  LayoutGrid, Files, Users, Clock, Trash2, Settings, ChevronLeft,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

type Item = { label: string; to: string; icon: React.ReactNode };
const navItems: Item[] = [
  { label: "Dashboard", to: "/", icon: <LayoutGrid size={18} /> },
  { label: "My Documents", to: "/?tab=mine", icon: <Files size={18} /> },
  { label: "Shared Projects", to: "/?tab=shared", icon: <Users size={18} /> },
  { label: "Recent", to: "/?tab=recent", icon: <Clock size={18} /> },
  { label: "Trash", to: "/?tab=trash", icon: <Trash2 size={18} /> },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const collapsed = !open;

  return (
    <>
      {/* overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed z-40 top-16 left-0 h-[calc(100%-64px)] bg-[var(--sidebar)] text-white border-r border-[var(--sidebar-border)]
        transition-all duration-200 ease-in-out
        ${open ? "w-[250px]" : "w-[72px]"}
        ${open ? "translate-x-0" : "lg:translate-x-0 -translate-x-full lg:-translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-[var(--sidebar-border)]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-[var(--accent)]" />
              {!collapsed && <span className="text-sm font-semibold tracking-wide">CollabCode</span>}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const active = location.pathname + location.search === item.to || (item.to === "/" && location.pathname === "/");
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm
                    hover:bg-white/5 transition ${
                      isActive || active ? "bg-white/10 text-[var(--accent)]" : "text-gray-300"
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer user/profile */}
          <div className="border-t border-[var(--sidebar-border)] p-3 flex items-center gap-3">
            <img
              className="h-9 w-9 rounded-full"
              src="https://ui-avatars.com/api/?name=JD&background=0b1020&color=fff"
              alt="User avatar"
            />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">John Doe</div>
                <div className="text-xs text-gray-400">john@company.com</div>
              </div>
            )}
            <button className="ml-auto text-gray-300 hover:text-white" aria-label="Settings">
              <Settings size={18} />
            </button>
          </div>

          {/* Collapse hint on desktop */}
          <div className="absolute -right-3 top-6 hidden lg:block">
            <div className="h-6 w-6 rounded-full bg-white shadow border flex items-center justify-center">
              <ChevronLeft size={14} className={`${open ? "" : "rotate-180"} transition`} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
