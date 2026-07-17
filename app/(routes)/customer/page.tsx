"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { Users, UserCheck, UserPlus, UserX } from "lucide-react";
import { CustomerStatsCard } from "./_components/CustomerStatsCard";
import { CustomerSearch } from "./_components/CustomerSearch";
import { CustomerFilter, type CustomerFilterValue } from "./_components/CustomerFilter";
import { CustomerList } from "./_components/CustomerList";
import { CustomerPagination } from "./_components/CustomerPagination";
import { CustomerDetailsSheet } from "./_components/CustomerDetailsSheet";
import type { Customer } from "@/lib/types/customers";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";


const PAGE_SIZE = 10;

const CustomersPage = () => {
  const router = useRouter();
  const customersQuery = useQuery(api.customers.list);
  const isLoading = customersQuery === undefined;
  const customers = customersQuery ?? [];
  const removeCustomer = useMutation(api.customers.remove);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilterValue>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter !== "All" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    });
  }, [customers, search, filter]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "Active").length;
    const prospects = customers.filter((c) => c.status === "Prospect").length;
    const churned = customers.filter((c) => c.status === "Churned").length;
    return { total, active, prospects, churned };
  }, [customers]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paginated = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleEdit = (customer: Customer) => {
    router.push(`/customer/edit/${customer.id}`);
  };

  const handleDelete = (customer: Customer) => {
    removeCustomer({ id: customer.id as Id<"customers"> } );
    setSelected((prev) => (prev?.id === customer.id ? null : prev));
  };

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div>
        <PageHeader
          title="Customer Management"
          description={`${filtered.length} customers in the current view`}
          actions={
            <>
              <Link
                href="/customer/create"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <Plus className="h-4 w-4" /> New Customer
              </Link>
            </>
          }
        />

        {/* Stats */}
        <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CustomerStatsCard label="Customers" value={String(stats.total)} icon={Users} hint="Total accounts" tone="default" />
          <CustomerStatsCard label="Active" value={String(stats.active)} icon={UserCheck} hint="Currently subscribed" tone="positive" />
          <CustomerStatsCard label="Prospects" value={String(stats.prospects)} icon={UserPlus} hint="In the pipeline" tone="positive" />
          <CustomerStatsCard label="Churned" value={String(stats.churned)} icon={UserX} hint="Lost accounts" tone="danger" />
        </div>

        {/* Filters + search */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CustomerFilter value={filter} onChange={setFilter} />
          <CustomerSearch value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <CustomerList items={paginated} onSelect={setSelected} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Pagination */}
        <CustomerPagination page={current} pageCount={pageCount} onPageChange={setPage} />

        <CustomerDetailsSheet customer={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default CustomersPage;