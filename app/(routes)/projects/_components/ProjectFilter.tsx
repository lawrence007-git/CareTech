"use client";
import type { ProjectStatus } from "@/lib/types/projects";

export type ProjectFilterValue = "All" | ProjectStatus;
const OPTIONS: ProjectFilterValue[] = ["All", "Planning", "In Progress", "On Hold", "Completed", "Cancelled"];

export function ProjectFilter({
  value,
  onChange,
}: {
  value: ProjectFilterValue;
  onChange: (v: ProjectFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
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
  );
}
