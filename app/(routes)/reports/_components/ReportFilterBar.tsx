"use client";
import { CATEGORY_OPTIONS, RANGE_OPTIONS, type ReportFilterValue } from "@/lib/types/reports";
import type { ReportRangeValue } from "./ReportPeriodFilter";

export function ReportFilterBar({
  category,
  onCategoryChange,
  range,
  onRangeChange,
}: {
  category: ReportFilterValue;
  onCategoryChange: (v: ReportFilterValue) => void;
  range: ReportRangeValue;
  onRangeChange: (v: ReportRangeValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((opt) => {
          const active = category === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onCategoryChange(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <select
        value={range}
        onChange={(e) => onRangeChange(e.target.value as ReportRangeValue)}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:w-44"
      >
        {RANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}