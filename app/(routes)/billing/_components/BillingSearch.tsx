"use client";

import { Search } from "lucide-react";

interface BillingSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function BillingSearch({ value, onChange, placeholder = "Search invoices..." }: BillingSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20"
      />
    </div>
  );
}