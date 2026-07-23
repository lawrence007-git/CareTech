"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "../../_components/PageHeader";
import { ProjectMonitorCard } from "../_components/ProjectMonitorCard";
import { PRIORITY_ORDER } from "@/lib/types/dashboard";
import { daysUntil } from "@/lib/types/projects";
import { FolderKanban } from "lucide-react";

export default function CustomerProjectsPage() {
  const projectsQuery = useQuery(api.projects.listMine);
  const isLoading = projectsQuery === undefined;
  const projects = projectsQuery ?? [];

  const active = [...projects]
    .filter((p) => p.status !== "Completed" && p.status !== "Cancelled")
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || daysUntil(a.due) - daysUntil(b.due));
  const finished = projects.filter((p) => p.status === "Completed" || p.status === "Cancelled");

  return (
    <div>
      <PageHeader
        title="My Projects"
        description="Track progress on everything we're building for you, updated in real time."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading your projects…</p>}

      {!isLoading && projects.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">No projects yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Once work kicks off on your account, you&apos;ll see progress, budget, and task status here.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active ({active.length})
          </h2>
          {active.map((p) => (
            <ProjectMonitorCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {finished.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Completed / closed ({finished.length})
          </h2>
          {finished.map((p) => (
            <ProjectMonitorCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}