"use client";
import type { StaffStatus } from "@/lib/types/staffs";

export type StaffFilterValue = "All" | StaffStatus;
const OPTIONS: StaffFilterValue[] = ["All", "Active", "On Leave", "Inactive"];

export function StaffFilter({ value, onChange }: { value: StaffFilterValue; onChange: (v: StaffFilterValue) => void }) {
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
