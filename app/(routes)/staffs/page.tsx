"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { Users, UserCheck, UserMinus, UserX } from "lucide-react";
import { StaffStatsCard } from "./_components/StaffStatsCard";
import { StaffSearch } from "./_components/StaffSearch";
import { StaffFilter, type StaffFilterValue } from "./_components/StaffFilter";
import { StaffList } from "./_components/StaffList";
import { StaffPagination } from "./_components/StaffPagination";
import { StaffDetailsSheet } from "./_components/StaffDetailsSheet";
import type { Staff } from "@/lib/types/staffs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 10;

const StaffsPage = () => {
  const router = useRouter();
  const staffsQuery = useQuery(api.staffs.list);
  const isLoading = staffsQuery === undefined;
  const staffs = staffsQuery ?? [];
  const removeStaff = useMutation(api.staffs.remove);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StaffFilterValue>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Staff | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffs.filter((s) => {
      if (filter !== "All" && s.status !== filter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [staffs, search, filter]);

  const stats = useMemo(() => {
    const total = staffs.length;
    const active = staffs.filter((s) => s.status === "Active").length;
    const onLeave = staffs.filter((s) => s.status === "On Leave").length;
    const inactive = staffs.filter((s) => s.status === "Inactive").length;
    return { total, active, onLeave, inactive };
  }, [staffs]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paginated = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleEdit = (staff: Staff) => {
    router.push(`/staffs/edit/${staff.id}`);
  };

  const handleDelete = (staff: Staff) => {
    removeStaff({ id: staff.id as Id<"staffs"> });
    setSelected((prev) => (prev?.id === staff.id ? null : prev));
  };

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div>
        <PageHeader
          title="Staff Management"
          description={`${filtered.length} staff members in the current view`}
          actions={
            <>
              <Link
                href="/staffs/create"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <Plus className="h-4 w-4" /> New Staff Member
              </Link>
            </>
          }
        />

        {/* Stats */}
        <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StaffStatsCard label="Headcount" value={String(stats.total)} icon={Users} hint="Total members" tone="default" />
          <StaffStatsCard label="Active" value={String(stats.active)} icon={UserCheck} hint="Currently working" status="Active" />
          <StaffStatsCard label="On leave" value={String(stats.onLeave)} icon={UserMinus} hint="Time off" status="On Leave" />
          <StaffStatsCard label="Inactive" value={String(stats.inactive)} icon={UserX} hint="Not currently active" status="Inactive" />
        </div>

        {/* Filters + search */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StaffFilter value={filter} onChange={setFilter} />
          <StaffSearch value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <StaffList items={paginated} onSelect={setSelected} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Pagination */}
        <StaffPagination page={current} pageCount={pageCount} onPageChange={setPage} />

        <StaffDetailsSheet staff={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default StaffsPage;