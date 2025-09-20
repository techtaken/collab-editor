import React from "react";

export default function AvatarGroup({ users, size = 24, max = 3 }: { users: { name: string; avatar?: string }[]; size?: number; max?: number }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <img
          key={i}
          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=94a3b8&color=fff`}
          alt={u.name}
          width={size}
          height={size}
          className="rounded-full border-2 border-white"
        />
      ))}
      {extra > 0 && (
        <div
          style={{ width: size, height: size }}
          className="rounded-full border-2 border-white bg-gray-200 text-xs flex items-center justify-center"
          aria-label={`${extra} more collaborators`}
          title={`${extra} more`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
