// src/views/TeamView.tsx
import { useEffect, useState, useCallback } from "react";
import { teamEndpoints, teamHandlers } from "../mocks/pages/team.mocks";
import { useRegisterMockEndpoints } from "@withgus/debug";

interface User {
  id: number;
  name: string;
  role: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const roleStyles: Record<
  string,
  { avatar: string; avatarText: string; badge: string; badgeText: string }
> = {
  developer: {
    avatar: "bg-blue-50",
    avatarText: "text-blue-600",
    badge: "bg-blue-50 border border-blue-200",
    badgeText: "text-blue-600",
  },
  designer: {
    avatar: "bg-violet-50",
    avatarText: "text-violet-600",
    badge: "bg-violet-50 border border-violet-200",
    badgeText: "text-violet-600",
  },
  pm: {
    avatar: "bg-emerald-50",
    avatarText: "text-emerald-600",
    badge: "bg-emerald-50 border border-emerald-200",
    badgeText: "text-emerald-600",
  },
};
function getRoleStyle(role: string) {
  return (
    roleStyles[role] ?? {
      avatar: "bg-surface3",
      avatarText: "text-muted",
      badge: "bg-surface3 border border-border",
      badgeText: "text-muted",
    }
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3.5 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-surface3" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-surface3 rounded" />
        <div className="h-2.5 w-20 bg-surface3 rounded" />
      </div>
      <div className="h-5 w-16 bg-surface3 rounded-full" />
    </div>
  );
}

export function TeamView() {
  // ── Register mock endpoints for this page ─────────────────────────────
  useRegisterMockEndpoints({
    pageId: "/team",
    endpoints: teamEndpoints,
    handlers: teamHandlers,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.example.com/users");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-sm mx-auto px-5 pt-14 pb-28">
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">
              members
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-tx tracking-tight">
            Team
          </h1>
          {!loading && !error && (
            <p className="text-sm text-muted mt-1">
              {users.length > 0
                ? `${users.length} members active`
                : "No members found"}
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-xl">
              ⚠
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Request failed</p>
              <p className="font-mono text-xs text-muted mt-1">{error}</p>
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-lg bg-surface border border-border2 text-sm font-medium text-tx hover:bg-surface3 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-2.5">
            {users.map((user, i) => {
              const s = getRoleStyle(user.role);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3.5 animate-fade-up hover:border-border2 hover:shadow-sm transition-all"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${s.avatar}`}
                  >
                    <span className={s.avatarText}>
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tx truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-1 rounded-full ${s.badge} ${s.badgeText}`}
                  >
                    {user.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-muted2 font-mono hover:bg-surface2 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 12a9 9 0 109-9M3 12V3m0 9H12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              refetch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
