"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TASK_STATUSES, TASK_COLUMN_ACCENT_SOLID, daysUntil } from "@/lib/types/tasks";

export function TaskFlow() {
  const tasksQuery = useQuery(api.tasks.list);
  const isLoading = tasksQuery === undefined;
  const tasks = tasksQuery ?? [];

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Task flow</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">A live snapshot of where work stands.</p>
        </div>
        <Link href="/tasks" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Open board <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading tasks…</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const items = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="rounded-lg border border-border/70 bg-surface p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${TASK_COLUMN_ACCENT_SOLID[status]}`} />
                  <span className="text-xs font-medium">{status}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="mt-2 space-y-2">
                  {items.slice(0, 2).map((t) => (
                    <div key={t.id} className="rounded-md bg-card p-2 shadow-xs">
                      <p className="truncate text-xs font-medium">{t.title}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t.assigneeInitials}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {daysUntil(t.due) < 0 ? "overdue" : `${daysUntil(t.due)}d`}
                        </span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-[11px] text-muted-foreground/70">Nothing here</p>}
                  {items.length > 2 && <p className="text-[10px] text-muted-foreground">+{items.length - 2} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}