"use client";

import { useMemo, useState } from "react";
import { FileBarChart, CalendarClock, AlertTriangle, FileDown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "../_components/PageHeader";
import { ReportStatsCard } from "./_components/ReportStatsCard";
import { ReportFilterBar } from "./_components/ReportFilterBar";
import { getRangeCutoff, getDefaultGranularity, type ReportRangeValue } from "./_components/ReportPeriodFilter";
import { ReportExport } from "./_components/ReportExport";
import { ReportTrendChart, ReportCategoryDonut, ReportStatusBarChart } from "./_components/ReportCharts";
import { ReportTable, type DrillFilter } from "./_components/ReportTable";
import { ReportDetailsSheet } from "./_components/ReportDetailsSheet";
import type { ReportItem, ReportFilterValue } from "@/lib/types/reports";

const ReportsPage = () => {
  const reportsQuery = useQuery(api.reports.list);
  const isLoading = reportsQuery === undefined;
  const REPORTS = reportsQuery ?? [];

  const [category, setCategory] = useState<ReportFilterValue>("All");
  const [range, setRange] = useState<ReportRangeValue>("year");
  const [drill, setDrill] = useState<DrillFilter>(null);
  const [selected, setSelected] = useState<ReportItem | null>(null);

  const granularity = getDefaultGranularity(range);

  const filtered = useMemo(() => {
    const cutoff = getRangeCutoff(range);
    return REPORTS.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (cutoff && new Date(r.date) < cutoff) return false;
      return true;
    });
  }, [REPORTS, category, range]);

  const readyCount = filtered.filter((r) => r.status === "Ready").length;
  const scheduledCount = filtered.filter((r) => r.status === "Scheduled").length;
  const failedCount = filtered.filter((r) => r.status === "Failed").length;

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-52 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <PageHeader
        title="Reports & analytics"
        description={`${filtered.length} reports in the current view`}
        actions={
          <div className="flex items-center gap-2">
            <ReportExport items={filtered} />
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatsCard label="Reports in view" value={String(filtered.length)} icon={FileBarChart} hint="matching filters" />
        <ReportStatsCard
          label="Ready"
          value={String(readyCount)}
          icon={FileDown}
          hint="click to view"
          tone="success"
          onClick={() => setDrill({ type: "status", value: "Ready" })}
        />
        <ReportStatsCard
          label="Scheduled"
          value={String(scheduledCount)}
          icon={CalendarClock}
          hint="click to view"
          tone="info"
          onClick={() => setDrill({ type: "status", value: "Scheduled" })}
        />
        <ReportStatsCard
          label="Failed"
          value={String(failedCount)}
          icon={AlertTriangle}
          hint="click to view"
          tone="warning"
          onClick={() => setDrill({ type: "status", value: "Failed" })}
        />
      </div>

      <ReportFilterBar category={category} onCategoryChange={setCategory} range={range} onRangeChange={setRange} />

      <ReportTrendChart items={filtered} granularity={granularity} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportCategoryDonut items={filtered} onSlice={(v) => setDrill({ type: "category", value: v })} />
        <ReportStatusBarChart items={filtered} onSlice={(v) => setDrill({ type: "status", value: v })} />
      </div>
      <ReportTable items={filtered} drill={drill} onClearDrill={() => setDrill(null)} onSelect={setSelected} />
      <ReportDetailsSheet report={selected} open={!!selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default ReportsPage;