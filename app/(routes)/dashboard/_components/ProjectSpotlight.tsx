"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PRIORITY_ORDER } from "@/lib/types/dashboard";
import {
  PROJECT_STATUS_CLASS,
  PROJECT_PRIORITY_CLASS,
  PROJECT_STATUS_ACCENT_SOLID,
  daysUntil,
} from "@/lib/types/projects";

export function ProjectSpotlight() {
  const projectsQuery = useQuery(api.projects.list);
  const isLoading = projectsQuery === undefined;
  const projects = projectsQuery ?? [];

  const spotlight = [...projects]
    .filter((p) => p.status !== "Completed" && p.status !== "Cancelled")
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || daysUntil(a.due) - daysUntil(b.due))
    .slice(0, 4);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Project spotlight</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Active work sorted by priority and deadline.</p>
        </div>
        <Link href="/projects" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading projects…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {spotlight.map((p) => {
            const daysLeft = daysUntil(p.due);
            const budgetPct = Math.min(100, Math.round((p.spent / p.budget) * 100));
            return (
              <li
                key={p.id}
                className="rounded-lg border border-border/70 p-3.5 transition hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.client} · {p.owner}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PROJECT_STATUS_CLASS[p.status]}`}>
                      {p.status}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PROJECT_PRIORITY_CLASS[p.priority]}`}>
                      {p.priority}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${PROJECT_STATUS_ACCENT_SOLID[p.status]}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Budget used</span>
                      <span>{budgetPct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${budgetPct > 90 ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {p.team.slice(0, 4).map((initials, idx) => (
                      <span
                        key={idx}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary-soft text-[10px] font-semibold text-primary-deep"
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      daysLeft < 0 ? "text-destructive" : daysLeft <= 5 ? "text-status-progress" : "text-muted-foreground"
                    }`}
                  >
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                </div>
              </li>
            );
          })}
          {spotlight.length === 0 && (
            <p className="text-xs text-muted-foreground">No active projects to spotlight.</p>
          )}
        </ul>
      )}
    </section>
  );
}