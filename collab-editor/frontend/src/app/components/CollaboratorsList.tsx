// src/components/CollaboratorsList.tsx
import React, { useEffect, useState } from "react";

type Member = {
  id: string;
  name?: string;
  email?: string;
};

export default function CollaboratorsList({
  docId,
  awareness,
}: {
  docId?: string;
  awareness?: any; // Yjs awareness instance from SocketIOProvider
}) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!docId) {
      setMembers([]);
      return;
    }

    // If an awareness instance is provided (preferred with Yjs + y-socket.io)
    if (awareness) {
      const readAwareness = () => {
        try {
          const states = Array.from(awareness.getStates().values());
          const users: Member[] = states
            .map((s: any) => {
              // common shape: { user: { id, name, email, color } } or direct { name, email }
              const u = s.user ?? s;
              const id = u?.id ?? s.clientId ?? Math.random().toString(36).slice(2, 9);
              return { id, name: u?.name, email: u?.email };
            })
            .filter(Boolean);
          setMembers(users);
        } catch (err) {
          console.error("Error reading awareness states", err);
        }
      };

      // initial read
      readAwareness();
      // subscribe to changes
      awareness.on("change", readAwareness);

      return () => {
        try {
          awareness.off("change", readAwareness);
        } catch (_) {}
        setMembers([]);
      };
    }

    // Fallback: if no awareness, show empty array or static placeholder
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
      {members.slice(0, 6).map((m) => (
        <div
          key={m.id}
          title={m.name ?? m.email}
          className="w-7 h-7 rounded-full bg-white/8 text-xs flex items-center justify-center text-white/90 border border-white/10"
        >
          {renderInitials(m.name, m.email)}
        </div>
      ))}
      {members.length > 6 && (
        <div className="w-7 h-7 rounded-full bg-white/6 text-xs flex items-center justify-center text-gray-300">
          +{members.length - 6}
        </div>
      )}
    </div>
  );
}
