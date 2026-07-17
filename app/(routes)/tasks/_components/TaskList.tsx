"use client";
import { CalendarDays, MessageSquare } from "lucide-react";
import {
  TASK_PRIORITY_ACCENT,
  TASK_PRIORITY_CLASS,
  TASK_STATUS_CLASS,
  TASK_OVERDUE_CLASS,
  daysUntil,
  type Task,
} from "@/lib/types/tasks";

export function TaskList({ items, onSelect }: { items: Task[]; onSelect: (t: Task) => void }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No tasks match the current filters.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {items.map((t, i) => {
        const days = daysUntil(t.due);
        const overdue = days < 0 && t.status !== "Done";
        return (
          <li
            key={t.id}
            onClick={() => onSelect(t)}
            className="group relative flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/40 animate-fade-in"
            style={{ animationDelay: `${i * 25}ms` }}
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${TASK_PRIORITY_ACCENT[t.priority]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`truncate text-sm font-medium group-hover:text-primary ${
                    t.status === "Done" ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {t.title}
                </p>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${TASK_PRIORITY_CLASS[t.priority]}`}>
                  {t.priority}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {t.project} · {t.assignee}
              </p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              {t.comments > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> {t.comments}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${overdue ? TASK_OVERDUE_CLASS : "text-muted-foreground"}`}>
                <CalendarDays className="h-3 w-3" />
                {overdue ? `${Math.abs(days)}d over` : `${days}d`}
              </span>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TASK_STATUS_CLASS[t.status]}`}>
              {t.status}
            </span>
          </li>
        );
      })}
    </ul>
  );
}