import React from "react";
import { MoreVertical, FileCode2 } from "lucide-react";
import AvatarGroup from "./AvatarGroup";

const langBadge = (lang?: string) => {
  const label = (lang || "plaintext").toUpperCase();
  return <span className="badge">{label}</span>;
};

export default function DocCard({
  name,
  updatedAt,
  language,
  collaborators = [],
  onOpen,
  onMenu,
  variant = "grid",
}: {
  name: string;
  updatedAt: string;
  language?: string;
  collaborators?: { name: string; avatar?: string }[];
  onOpen: () => void;
  onMenu?: () => void;
  variant?: "grid" | "list";
}) {
  const body = (
    <div className="card group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCode2 size={18} />
          </div>
          <div>
            <div className="font-medium leading-tight">{name}</div>
            <div className="text-xs text-gray-500">Modified {new Date(updatedAt).toLocaleString()}</div>
          </div>
        </div>
        <button
          className="icon-btn h-9 w-9 opacity-0 group-hover:opacity-100"
          aria-label="Document actions"
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {langBadge(language)}
        <AvatarGroup users={collaborators} />
      </div>
    </div>
  );

  if (variant === "list") {
    return (
      <div
        className="card group cursor-pointer grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCode2 size={18} />
          </div>
          <div>
            <div className="font-medium leading-tight">{name}</div>
            <div className="text-xs text-gray-500">Modified {new Date(updatedAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="justify-self-end">{langBadge(language)}</div>
        <div className="justify-self-end">
          <AvatarGroup users={collaborators} />
        </div>
        <button
          className="icon-btn h-9 w-9 opacity-100 md:opacity-0 md:group-hover:opacity-100 justify-self-end"
          aria-label="Document actions"
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      {body}
    </div>
  );
}
