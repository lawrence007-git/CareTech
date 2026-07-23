"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  PROJECT_STATUS_CLASS,
  PROJECT_PRIORITY_CLASS,
  PROJECT_STATUS_ACCENT_SOLID,
  daysUntil,
} from "@/lib/types/projects";
import { TASK_STATUS_CLASS, TASK_STATUSES } from "@/lib/types/tasks";
import type { Project } from "@/lib/types/projects";
import { CalendarClock, Users } from "lucide-react";

export function ProjectMonitorCard({ project }: { project: Project }) {
  const tasksQuery = useQuery(api.tasks.listMineForProject, { project: project.name });
  const isLoadingTasks = tasksQuery === undefined;
  const tasks = tasksQuery ?? [];
  const budgetPct = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;
  const daysLeft = daysUntil(project.due);

  const statusCounts = TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <Accordion type="single" collapsible className="rounded-xl border border-border bg-card shadow-sm">
      <AccordionItem value={project.id} className="border-b-0">
        <AccordionTrigger className="px-5 py-4 hover:no-underline">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-2 text-left">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{project.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> Led by {project.owner}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PROJECT_STATUS_CLASS[project.status]}`}>
                {project.status}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PROJECT_PRIORITY_CLASS[project.priority]}`}>
                {project.priority}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${PROJECT_STATUS_ACCENT_SOLID[project.status]}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Budget utilization</span>
                <span>{budgetPct}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${budgetPct > 90 ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Due {project.due} ·{" "}
              <span className={daysLeft < 0 ? "font-medium text-destructive" : ""}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            </span>
            <span>
              {project.tasksDone}/{project.tasksTotal} tasks complete
            </span>
          </div>

          {/* Task breakdown */}
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task breakdown</p>

            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {statusCounts.map(({ status, count }) => (
                <div key={status} className="rounded-lg border border-border/70 px-2.5 py-2 text-center">
                  <p className="text-base font-semibold tabular-nums">{count}</p>
                  <p className={`mt-0.5 inline-block rounded-full px-1.5 text-[10px] font-medium ${TASK_STATUS_CLASS[status]}`}>
                    {status}
                  </p>
                </div>
              ))}
            </div>

            <ul className="mt-3 space-y-1.5">
              {isLoadingTasks && <p className="text-xs text-muted-foreground">Loading tasks…</p>}
              {!isLoadingTasks && tasks.length === 0 && (
                <p className="text-xs text-muted-foreground">No tasks logged for this project yet.</p>
              )}
              {tasks.slice(0, 8).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent/40"
                >
                  <span className="truncate">{t.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${TASK_STATUS_CLASS[t.status]}`}>
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}