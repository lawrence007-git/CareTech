"use client";

import { Receipt, UserPlus, FileBarChart, CheckCircle2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { timeAgo, type ActivityItem } from "@/lib/types/dashboard";
import { INVOICE_STATUS_CLASS } from "@/lib/types/billing";
import { TASK_STATUS_CLASS } from "@/lib/types/tasks";
import { CUSTOMER_STATUS_CLASS } from "@/lib/types/customers";
import { REPORT_STATUS_CLASS } from "@/lib/types/reports";

export function ActivityFeed() {
  const invoicesQuery = useQuery(api.billing.list);
  const tasksQuery = useQuery(api.tasks.list);
  const customersQuery = useQuery(api.customers.list);
  const reportsQuery = useQuery(api.reports.list);

  const isLoading =
    invoicesQuery === undefined ||
    tasksQuery === undefined ||
    customersQuery === undefined ||
    reportsQuery === undefined;

  const invoices = invoicesQuery ?? [];
  const tasks = tasksQuery ?? [];
  const customers = customersQuery ?? [];
  const reports = reportsQuery ?? [];

  const items: ActivityItem[] = [
    ...invoices
      .filter((i) => i.status === "Paid")
      .map((i) => ({
        id: `inv-${i.id}`,
        icon: Receipt,
        text: `${i.customer} paid invoice ${i.id}`,
        meta: i.amount,
        date: new Date(i.due),
        tone: INVOICE_STATUS_CLASS[i.status],
      })),
    ...tasks
      .filter((t) => t.status === "Done")
      .map((t) => ({
        id: `task-${t.id}`,
        icon: CheckCircle2,
        text: `${t.assignee} completed "${t.title}"`,
        meta: t.project,
        date: new Date(t.due),
        tone: TASK_STATUS_CLASS[t.status],
      })),
    ...customers
      .filter((c) => c.status === "Prospect")
      .map((c) => ({
        id: `cust-${c.id}`,
        icon: UserPlus,
        text: `${c.name} joined as a prospect`,
        meta: c.company,
        date: new Date(c.joined),
        tone: CUSTOMER_STATUS_CLASS[c.status],
      })),
    ...reports
      .filter((r) => r.status === "Ready")
      .map((r) => ({
        id: `rep-${r.id}`,
        icon: FileBarChart,
        text: `${r.name} is ready`,
        meta: r.category,
        date: new Date(r.date),
        tone: REPORT_STATUS_CLASS[r.status],
      })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 7);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Recent activity</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">What&apos;s been happening across the system.</p>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading activity…</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-accent/40">
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                  <Icon className="h-4 w-4" />
                  {idx === 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-status-progress" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.text}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(item.date)}</span>
              </li>
            );
          })}
          {items.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">No recent activity yet.</p>
          )}
        </ul>
      )}
    </section>
  );
}