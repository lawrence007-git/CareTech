"use client";

import { ListChecks, FolderKanban } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type AgendaItem } from "@/lib/types/dashboard";
import { daysUntil as taskDaysUntil } from "@/lib/types/tasks";
import { daysUntil as projectDaysUntil } from "@/lib/types/projects";

export function AgendaTimeline() {
  const tasksQuery = useQuery(api.tasks.list);
  const projectsQuery = useQuery(api.projects.list);
  const isLoading = tasksQuery === undefined || projectsQuery === undefined;
  const tasks = tasksQuery ?? [];
  const projects = projectsQuery ?? [];

  const items: AgendaItem[] = [
    ...tasks
      .filter((t) => t.status !== "Done")
      .map((t) => ({
        id: t.id,
        title: t.title,
        meta: t.assignee,
        due: t.due,
        kind: "task" as const,
      })),
    ...projects
      .filter((p) => p.status !== "Completed" && p.status !== "Cancelled")
      .map((p) => ({
        id: p.id,
        title: p.name,
        meta: p.owner,
        due: p.due,
        kind: "project" as const,
      })),
  ]
    .sort((a, b) => daysUntilFor(a) - daysUntilFor(b))
    .slice(0, 6);

  function daysUntilFor(item: AgendaItem) {
    return item.kind === "task" ? taskDaysUntil(item.due) : projectDaysUntil(item.due);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Coming up</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Nearest deadlines across projects and tasks.</p>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading agenda…</p>
      ) : (
        <ol className="relative mt-4 space-y-4 border-l border-border pl-4">
          {items.map((item) => {
            const days = daysUntilFor(item);
            const urgent = days < 0;
            const soon = days >= 0 && days <= 3;
            const Icon = item.kind === "task" ? ListChecks : FolderKanban;
            return (
              <li key={`${item.kind}-${item.id}`} className="relative">
                <span
                  className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card ${
                    urgent ? "bg-destructive" : soon ? "bg-status-progress" : "bg-primary"
                  }`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      urgent ? "text-destructive" : soon ? "text-status-progress" : "text-muted-foreground"
                    }`}
                  >
                    {urgent ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d`}
                  </span>
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground">Nothing on the horizon.</p>
          )}
        </ol>
      )}
    </section>
  );
}