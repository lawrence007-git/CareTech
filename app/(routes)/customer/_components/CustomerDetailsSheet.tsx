"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { CUSTOMER_STATUS_CLASS, type Customer } from "@/lib/types/customers";

interface CustomerDetailsSheetProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

export function CustomerDetailsSheet({ customer, open, onClose }: CustomerDetailsSheetProps) {
  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
            <h2 className="font-display text-lg font-semibold text-foreground">{customer.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <Row label="Company" value={customer.company} />
          <Row label="Email" value={customer.email} />
          <Row label="Phone" value={customer.phone} />
          <Row label="Plan" value={customer.plan} />
          <Row label="Joined" value={customer.joined} />
          <Row label="Lifetime value" value={customer.lifetimeValue} />
          <Row
            label="Status"
            value={
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${CUSTOMER_STATUS_CLASS[customer.status]}`}>
                {customer.status}
              </span>
            }
          />
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}