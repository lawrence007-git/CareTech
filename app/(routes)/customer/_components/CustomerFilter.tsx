"use client";
import type { CustomerStatus } from "@/lib/types/customers";

export type CustomerFilterValue = "All" | CustomerStatus;
const OPTIONS: CustomerFilterValue[] = ["All", "Active", "Prospect", "Inactive", "Churned"];

export function CustomerFilter({
  value,
  onChange,
}: {
  value: CustomerFilterValue;
  onChange: (v: CustomerFilterValue) => void;
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