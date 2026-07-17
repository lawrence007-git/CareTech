"use client";

import { useId, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CHART_TOOLTIP_STYLE, parseAmount, monthKey, monthLabel } from "@/lib/types/dashboard";

export function RevenuePulse() {
  const gradPaid = useId();
  const gradPending = useId();

  const invoicesQuery = useQuery(api.billing.list);
  const isLoading = invoicesQuery === undefined;
  const invoices = invoicesQuery ?? [];

  const data = useMemo(() => {
    const buckets = new Map<number, { key: number; label: string; paid: number; pending: number }>();
    for (const inv of invoices) {
      const key = monthKey(inv.issued);
      const label = monthLabel(inv.issued);
      const amount = parseAmount(inv.amount);
      const existing = buckets.get(key) ?? { key, label, paid: 0, pending: 0 };
      if (inv.status === "Paid") existing.paid += amount;
      else if (inv.status === "Pending" || inv.status === "Overdue") existing.pending += amount;
      buckets.set(key, existing);
    }
    return Array.from(buckets.values()).sort((a, b) => a.key - b.key);
  }, [invoices]);

  const totalPaid = data.reduce((s, d) => s + d.paid, 0);
  const totalPending = data.reduce((s, d) => s + d.pending, 0);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Revenue pulse</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Paid vs. outstanding, by month issued.</p>
        </div>
        <div className="flex gap-4 text-right text-xs">
          <div>
            <p className="text-muted-foreground">Collected</p>
            <p className="font-semibold text-status-done">${totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Outstanding</p>
            <p className="font-semibold text-status-progress">${totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading revenue…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id={gradPaid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-done)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--status-done)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={gradPending} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-progress)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--status-progress)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis
                width={44}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "paid" ? "Paid" : "Outstanding",
                ]}
              />
              <Area type="monotone" dataKey="paid" stroke="var(--status-done)" strokeWidth={2.5} fill={`url(#${gradPaid})`} />
              <Area type="monotone" dataKey="pending" stroke="var(--status-progress)" strokeWidth={2.5} fill={`url(#${gradPending})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}