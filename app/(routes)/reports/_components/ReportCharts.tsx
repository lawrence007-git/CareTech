"use client";
import { useId } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LabelList,
} from "recharts";
import { ReportCard } from "./ReportCard";
import { CATEGORY_COLOR, STATUS_COLOR, type ReportItem, type ReportCategory, type ReportStatus } from "@/lib/types/reports";
import type { ReportGranularity } from "./ReportPeriodFilter";

function bucketLabel(dateStr: string, granularity: ReportGranularity) {
  const d = new Date(dateStr);
  if (granularity === "year") return String(d.getFullYear());
  if (granularity === "month") return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Sortable numeric key so buckets can be ordered chronologically, independent of the display label. */
function bucketSortKey(dateStr: string, granularity: ReportGranularity) {
  const d = new Date(dateStr);
  if (granularity === "year") return d.getFullYear();
  if (granularity === "month") return d.getFullYear() * 100 + (d.getMonth() + 1);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Groups valid items into buckets for a given granularity, sorted chronologically. */
function buildBuckets(validItems: ReportItem[], granularity: ReportGranularity) {
  const buckets = new Map<number, { label: string; count: number }>();
  for (const r of validItems) {
    const key = bucketSortKey(r.date, granularity);
    const label = bucketLabel(r.date, granularity);
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { label, count: 1 });
    }
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v);
}

/** If a granularity collapses everything into a single point (or none), drill into a finer one
 *  so a real trend can be drawn whenever the underlying data actually varies. */
function pickBucketsWithSpread(validItems: ReportItem[], granularity: ReportGranularity) {
  const order: ReportGranularity[] = ["year", "month", "day"];
  let startIdx = order.indexOf(granularity);
  for (let i = startIdx; i < order.length; i++) {
    const g = order[i];
    const data = buildBuckets(validItems, g);
    if (data.length > 1 || i === order.length - 1) {
      return { data, usedGranularity: g };
    }
  }
  return { data: buildBuckets(validItems, granularity), usedGranularity: granularity };
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

export function ReportTrendChart({ items, granularity }: { items: ReportItem[]; granularity: ReportGranularity }) {
  const gradientId = useId();

  const validItems = items.filter((r) => !Number.isNaN(new Date(r.date).getTime()));
  const invalidCount = items.length - validItems.length;

  const { data, usedGranularity } = pickBucketsWithSpread(validItems, granularity);

  const granularityLabel = usedGranularity === "day" ? "day" : usedGranularity === "month" ? "month" : "year";
  const description = `Number of reports generated per ${granularityLabel}, based on the current filters.`;

  if (data.length === 0) {
    return (
      <ReportCard title="Reports over time" description={description}>
        <EmptyState />
      </ReportCard>
    );
  }

  return (
    <ReportCard
      title="Reports over time"
      description={
        invalidCount > 0
          ? `${description} (${invalidCount} report(s) skipped due to an invalid date.)`
          : data.length === 1
          ? `${description} Only one date in range, so there's a single point instead of a line.`
          : description
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  );
}

function DonutCard({
  title,
  description,
  data,
  colorMap,
  total,
  onSlice,
}: {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
  colorMap: Record<string, string>;
  total: number;
  onSlice: (name: string) => void;
}) {
  if (total === 0) {
    return (
      <ReportCard title={title} description={description}>
        <EmptyState />
      </ReportCard>
    );
  }

  return (
    <ReportCard title={title} description={description}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                stroke="none"
                onClick={(entry) => onSlice(entry.name as string)}
                cursor="pointer"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={colorMap[d.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{total}</span>
            <span className="text-[11px] text-muted-foreground">total</span>
          </div>
        </div>

        <div className="w-full space-y-2 sm:w-auto">
          {data.map((d) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <button
                key={d.name}
                onClick={() => onSlice(d.name)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent sm:w-40"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorMap[d.name] }} />
                  {d.name}
                </span>
                <span className="text-muted-foreground">{d.value} · {pct}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </ReportCard>
  );
}

export function ReportCategoryDonut({ items, onSlice }: { items: ReportItem[]; onSlice: (category: ReportCategory) => void }) {
  const counts = new Map<ReportCategory, number>();
  for (const r of items) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  const data = Array.from(counts, ([name, value]) => ({ name, value }));
  return (
    <DonutCard
      title="By category"
      description="Share of reports by category. Click a slice or a category in the list to see just those reports."
      data={data}
      colorMap={CATEGORY_COLOR}
      total={items.length}
      onSlice={(v) => onSlice(v as ReportCategory)}
    />
  );
}

function StatusBarChart({
  data,
  total,
  onSlice,
}: {
  data: { name: ReportStatus; value: number }[];
  total: number;
  onSlice: (status: ReportStatus) => void;
}) {
  const description = "Count of reports in each status. Click a bar to see just those reports.";

  if (total === 0) {
    return (
      <ReportCard title="By status" description={description}>
        <EmptyState />
      </ReportCard>
    );
  }

  return (
    <ReportCard title="By status" description={description}>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: -12, bottom: 0 }} barCategoryGap="32%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--accent)" }}
              contentStyle={tooltipStyle}
              formatter={(value) => {
                const num = Number(value);
                return [`${num.toFixed(2)}`, "Series Name"];
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64} onClick={(entry) => onSlice(entry.name as ReportStatus)} cursor="pointer">
              {data.map((d) => (
                <Cell key={d.name} fill={STATUS_COLOR[d.name]} />
              ))}
              <LabelList dataKey="value" position="top" style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  );
}

export function ReportStatusBarChart({ items, onSlice }: { items: ReportItem[]; onSlice: (status: ReportStatus) => void }) {
  const counts = new Map<ReportStatus, number>();
  for (const r of items) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  const data = Array.from(counts, ([name, value]) => ({ name, value }));
  return <StatusBarChart data={data} total={items.length} onSlice={onSlice} />;
}

function EmptyState() {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      No data for the current filters.
    </div>
  );
}