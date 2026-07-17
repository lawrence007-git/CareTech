"use client";
import { X, TrendingUp, Users, UserCheck, Settings2, type LucideIcon } from "lucide-react";
import { REPORT_STATUS_CLASS, CATEGORY_ICON, type ReportItem, type ReportCategory } from "@/lib/types/reports";



export type DrillFilter = { type: "category" | "status"; value: string } | null;

export function ReportPanel({
  drill,
  items,
  onClear,
  onSelect,
}: {
  drill: DrillFilter;
  items: ReportItem[];
  onClear: () => void;
  onSelect: (r: ReportItem) => void;
}) {
  if (!drill) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          {drill.type === "category" ? "Category" : "Status"}: {drill.value}
          <span className="ml-2 text-xs font-normal text-muted-foreground">({items.length} reports)</span>
        </p>
        <button onClick={onClear} className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Close drill-through">
          <X className="h-4 w-4" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No reports match this selection.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((r) => {
            const Icon = CATEGORY_ICON[r.category];
            return (
              <li
                key={r.id}
                onClick={() => onSelect(r)}
                className="flex cursor-pointer items-center gap-3 py-2.5 hover:bg-accent"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.category} · {r.period}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${REPORT_STATUS_CLASS[r.status]}`}>
                  {r.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}