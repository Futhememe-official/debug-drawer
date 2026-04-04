// src/views/ReportsView.tsx
import { useEffect, useState, useCallback } from "react";
import { useRegisterMockEndpoints } from "@withgus/debug";
import {
  reportsEndpoints,
  reportsHandlers,
} from "../mocks/pages/reports.mocks";

interface Report {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl px-4 py-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-40 bg-surface3 rounded" />
        <div className="h-5 w-16 bg-surface3 rounded-full" />
      </div>
      <div className="h-2.5 w-24 bg-surface3 rounded" />
    </div>
  );
}

const statusStyle: Record<string, string> = {
  published: "bg-emerald-50 border border-emerald-200 text-emerald-700",
  draft: "bg-amber-50 border border-amber-200 text-amber-700",
};

export function ReportsView() {
  // ── Register mock endpoints for this page ─────────────────────────────
  useRegisterMockEndpoints({
    pageId: "/reports",
    endpoints: reportsEndpoints,
    handlers: reportsHandlers,
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.example.com/reports");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setReports(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-sm mx-auto px-5 pt-14 pb-28">
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">
              analytics
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-tx tracking-tight">
            Reports
          </h1>
          {!loading && !error && (
            <p className="text-sm text-muted mt-1">
              {reports.length > 0
                ? `${reports.length} reports`
                : "No reports yet"}
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
              onClick={fetchReports}
              className="px-4 py-2 rounded-lg bg-surface border border-border2 text-sm font-medium text-tx hover:bg-surface3 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-2.5">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <p className="text-sm text-muted">No reports found</p>
              </div>
            ) : (
              reports.map((r, i) => (
                <div
                  key={r.id}
                  className="bg-surface border border-border rounded-2xl px-4 py-4 animate-fade-up hover:border-border2 hover:shadow-sm transition-all"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-tx">{r.title}</p>
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusStyle[r.status] ?? "bg-surface3 text-muted border border-border"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted">
                    {r.createdAt}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={fetchReports}
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
