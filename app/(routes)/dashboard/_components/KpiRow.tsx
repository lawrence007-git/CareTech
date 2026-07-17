"use client";

import { useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";
import { FolderKanban, ListChecks, Wallet, UserCog, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { parseAmount, sparkline } from "@/lib/types/dashboard";
import { useCountUp } from "@/hooks/use-count-up";

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  prefix = "",
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconClassName: string;
  prefix?: string;
}) {
  const animated = useCountUp(value);
  const gradientId = useId();
  const data = sparkline(value);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
            {prefix}
            {animated.toLocaleString()}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-3 h-9 w-full opacity-70 transition-opacity group-hover:opacity-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--primary)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function KpiRow() {
  const projects = useQuery(api.projects.list) ?? [];
  const tasks = useQuery(api.tasks.list) ?? [];
  const staffs = useQuery(api.staffs.list) ?? [];
  const customers = useQuery(api.customers.list) ?? [];
  const invoices = useQuery(api.billing.list) ?? [];

  const activeProjects = projects.filter((p) => p.status === "In Progress").length;
  const openTasks = tasks.filter((t) => t.status !== "Done").length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;
  const revenuePaid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + parseAmount(i.amount), 0);
  const pendingInvoices = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").length;
  const activeStaff = staffs.filter((s) => s.status === "Active").length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        label="Active Projects"
        value={activeProjects}
        hint={`of ${projects.length} total`}
        icon={FolderKanban}
        iconClassName="bg-status-planning/10 text-status-planning"
      />
      <KpiCard
        label="Open Tasks"
        value={openTasks}
        hint={`${blockedTasks} blocked`}
        icon={ListChecks}
        iconClassName="bg-status-progress/10 text-status-progress"
      />
      <KpiCard
        label="Revenue Collected"
        value={revenuePaid}
        prefix="$"
        hint={`${pendingInvoices} invoices pending`}
        icon={Wallet}
        iconClassName="bg-status-done/10 text-status-done"
      />
      <KpiCard
        label="Team On Shift"
        value={activeStaff}
        hint={`of ${staffs.length} staff`}
        icon={UserCog}
        iconClassName="bg-primary/10 text-primary"
      />
      <KpiCard
        label="Active Customers"
        value={activeCustomers}
        hint={`of ${customers.length} accounts`}
        icon={Users}
        iconClassName="bg-status-onhold/10 text-status-onhold"
      />
    </div>
  );
}