"use client";

import type { InvoiceStatus } from "@/lib/types/billing";

export type BillingFilterValue = "All" | InvoiceStatus;

const OPTIONS: BillingFilterValue[] = ["All", "Paid", "Pending", "Overdue", "Draft"];

interface BillingFilterProps {
  value: BillingFilterValue;
  onChange: (v: BillingFilterValue) => void;
}

export function BillingFilter({ value, onChange }: BillingFilterProps) {
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
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}