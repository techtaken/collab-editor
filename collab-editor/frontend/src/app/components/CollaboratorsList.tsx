// src/components/CollaboratorsList.tsx
import React, { useEffect, useState } from "react";

type Member = {
  id: string;
  name?: string;
  email?: string;
};

// Color palette for user avatars
const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-pink-500 to-rose-600",
  "from-green-500 to-emerald-600",
  "from-yellow-500 to-orange-600",
  "from-red-500 to-pink-600",
  "from-teal-500 to-green-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-blue-600",
];

// Generate consistent color for a user ID
const getColorForUser = (userId: string): string => {
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export default function CollaboratorsList({
  docId,
  awareness,
}: {
  docId?: string;
  awareness?: any;
}) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!docId) {
      setMembers([]);
      return;
    }

    // console.log("CollaboratorsList mounted for docId:", docId, "awareness:", !!awareness);

    if (awareness) {
      const readAwareness = () => {
        try {
          const states = Array.from(awareness.getStates().values());
          // console.log("📍 Awareness states count:", states.length, "states:", states);

          const users: Member[] = states
            .map((s: any) => {
              const u = s.user ?? s;
              const id = u?.id ?? s.clientId ?? Math.random().toString(36).slice(2, 9);
              console.log("  → Mapped user:", { id, name: u?.name, email: u?.email });
              return { id, name: u?.name, email: u?.email };
            })
            .filter(Boolean);

          // console.log("✅ Final members array:", users);
          setMembers(users);
        } catch (err) {
          console.error("❌ Error reading awareness states", err);
        }
      };

      readAwareness();

      // Listen to state updates (user joins, updates presence)
      awareness.on("change", readAwareness);

      return () => {
        try {
          awareness.off("change", readAwareness);
        } catch (_) { }
        setMembers([]);
      };
    }

    setMembers([]);
    return;
  }, [docId, awareness]);

  const renderInitials = (name?: string, email?: string) => {
    const label = (name && name.trim()) || (email && email.split("@")[0]) || "U";
    const parts = label.split(/\s+/).filter(Boolean);
    let initials =
      parts.length === 1
        ? parts[0][0]
        : (parts[0][0] + (parts[1]?.[0] ?? "")).slice(0, 2);
    return initials.toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      {members.length === 0 && (
        <span className="text-xs text-gray-500">No collaborators</span>
      )}
      {members.slice(0, 6).map((m) => (
        <div
          key={'CL' + m.id}
          title={m.name ?? m.email}
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${getColorForUser(m.id)} text-xs font-semibold flex items-center justify-center text-white shadow-md border border-white/30 hover:shadow-lg hover:scale-110 transition-transform`}
        >
          {renderInitials(m.name, m.email)}
        </div>
      ))}
      {members.length > 6 && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-xs font-semibold flex items-center justify-center text-white border border-gray-400/50 shadow-md">
          +{members.length - 6}
        </div>
      )}
    </div>
  );
}
