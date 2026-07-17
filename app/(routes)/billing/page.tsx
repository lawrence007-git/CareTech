"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { BillingStatsCard } from "./_components/BillingStatsCard";
import { BillingSearch } from "./_components/BillingSearch";
import { BillingFilter, type BillingFilterValue } from "./_components/BillingFilter";
import { BillingList } from "./_components/BillingList";
import { BillingPagination } from "./_components/BillingPagination";
import { BillingDetailsSheet } from "./_components/BillingDetailsSheet";
import type { Invoice } from "@/lib/types/billing";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 10;

function sumAmount(invoices: Invoice[]) {
  return invoices.reduce((total, inv) => {
    const n = Number.parseFloat(inv.amount.replace(/[^0-9.-]/g, ""));
    return total + (Number.isFinite(n) ? n : 0);
  }, 0);
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const BillingPage = () => {
  const router = useRouter();
  const invoicesQuery = useQuery(api.billing.list);
  const isLoading = invoicesQuery === undefined;
  const invoices = invoicesQuery ?? [];
  const removeInvoice = useMutation(api.billing.remove);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BillingFilterValue>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      if (filter !== "All" && i.status !== filter) return false;
      if (!q) return true;
      return i.id.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q);
    });
  }, [invoices, search, filter]);

  const stats = useMemo(() => {
    const byStatus = (s: string) => invoices.filter((i) => i.status === s);
    return {
      paid: currency.format(sumAmount(byStatus("Paid"))),
      pending: currency.format(sumAmount(byStatus("Pending"))),
      overdue: currency.format(sumAmount(byStatus("Overdue"))),
      draft: currency.format(sumAmount(byStatus("Draft"))),
    };
  }, [invoices]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paginated = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleEdit = (invoice: Invoice) => {
    router.push(`/billing/edit/${invoice.id}`);
  };

  const handleDelete = (invoice: Invoice) => {
    removeInvoice({ id: invoice.id as Id<"billing"> });
    setSelected((prev) => (prev?.id === invoice.id ? null : prev));
  };

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">Loading invoices…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div>
        <PageHeader
          title="Billing Management"
          description={`${filtered.length} invoices in the current view`}
          actions={
            <Link
              href="/billing/create"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New Invoice
            </Link>
          }
        />

        {/* Stats */}
        <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <BillingStatsCard label="Paid" value={stats.paid} hint="Fully paid" status="Paid" />
          <BillingStatsCard label="Pending" value={stats.pending} hint="Not yet paid" status="Pending" />
          <BillingStatsCard label="Overdue" value={stats.overdue} hint="Needs attention" status="Overdue" />
          <BillingStatsCard label="Draft" value={stats.draft} hint="Not yet sent" status="Draft" />
        </div>

        {/* Filters + search */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BillingFilter value={filter} onChange={setFilter} />
          <BillingSearch value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <BillingList items={paginated} onSelect={setSelected} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Pagination */}
        <BillingPagination page={current} pageCount={pageCount} onPageChange={setPage} />

        <BillingDetailsSheet invoice={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default BillingPage;