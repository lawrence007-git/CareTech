"use client";

import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FocusList() {
  const tasksQuery = useQuery(api.tasks.list);
  const isLoading = tasksQuery === undefined;
  const tasks = tasksQuery ?? [];

  const initial = tasks.filter((t) => t.priority === "High" && t.status !== "Done").slice(0, 5);
  const [done, setDone] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  const completedCount = Object.values(done).filter(Boolean).length;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Your focus list</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">High-priority items worth tackling first.</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {completedCount}/{initial.length}
        </span>
      </div>

      {isLoading ? (
        <p className="mt-3 px-2.5 py-2 text-xs text-muted-foreground">Loading focus list…</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {initial.map((t) => {
            const checked = !!done[t.id];
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-accent/50 ${
                    checked ? "opacity-50" : ""
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={`truncate ${checked ? "line-through" : ""}`}>{t.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{t.assigneeInitials}</span>
                </button>
              </li>
            );
          })}
          {initial.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">No high-priority tasks right now — nice work.</p>
          )}
        </ul>
      )}
    </section>
  );
}