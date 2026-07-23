"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "../../_components/PageHeader";
import { StatsCard } from "../../_components/StatsCard";
import { INVOICE_STATUS_CLASS } from "@/lib/types/billing";
import { parseAmount } from "@/lib/types/dashboard";
import { Receipt, CheckCircle2, AlertTriangle } from "lucide-react";

export default function CustomerBillingPage() {
  const invoicesQuery = useQuery(api.billing.listMine);
  const isLoading = invoicesQuery === undefined;
  const invoices = invoicesQuery ?? [];

  const paidTotal = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + parseAmount(i.amount), 0);
  const outstanding = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue");
  const outstandingTotal = outstanding.reduce((s, i) => s + parseAmount(i.amount), 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  return (
    <div>
      <PageHeader title="My Billing" description="Invoices and payment status for your account." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Total Paid"
          value={`$${paidTotal.toLocaleString()}`}
          hint={`${invoices.filter((i) => i.status === "Paid").length} invoices`}
          icon={CheckCircle2}
          iconClassName="bg-status-done/10 text-status-done"
        />
        <StatsCard
          label="Outstanding"
          value={`$${outstandingTotal.toLocaleString()}`}
          hint={`${outstanding.length} invoice${outstanding.length === 1 ? "" : "s"} due`}
          icon={Receipt}
          iconClassName="bg-status-onhold/10 text-status-onhold"
        />
        <StatsCard
          label="Overdue"
          value={String(overdueCount)}
          hint={overdueCount > 0 ? "Needs attention" : "All caught up"}
          icon={AlertTriangle}
          iconClassName={overdueCount > 0 ? "bg-status-blocked/10 text-status-blocked" : "bg-muted text-muted-foreground"}
          valueClassName={overdueCount > 0 ? "text-status-blocked" : undefined}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading invoices…</p>}

        {!isLoading && invoices.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No invoices on file yet.</p>
        )}

        {!isLoading && invoices.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Issued</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-b-0 hover:bg-accent/30">
                  <td className="px-5 py-3 text-muted-foreground">{inv.issued}</td>
                  <td className="px-5 py-3 text-muted-foreground">{inv.due}</td>
                  <td className="px-5 py-3 font-medium tabular-nums">{inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_CLASS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}