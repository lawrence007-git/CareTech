"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Briefcase, UserCog, Users } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { UserStatsCard } from "./_components/UserStatsCard";
import { UserSearch } from "./_components/UserSearch";
import { UserFilter, type UserFilterValue } from "./_components/UserFilter";
import { UserList } from "./_components/UserList";
import { UserPagination } from "./_components/UserPagination";
import { UserDetailsSheet } from "./_components/UserDetailSheet";
import type { User } from "@/lib/types/users";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const PAGE_SIZE = 10;

const UsersPage = () => {
  const router = useRouter();
  const usersQuery = useQuery(api.users.list);
  const isLoading = usersQuery === undefined;
  const users = usersQuery ?? [];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilterValue>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "All" && u.role !== filter) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, search, filter]);

  const counts = useMemo(() => {
    return {
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      staff: users.filter((u) => u.role === "staff").length,
      customer: users.filter((u) => u.role === "customer").length,
    };
  }, [users]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paginated = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  if (isLoading) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">Loading users…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <div>
        <PageHeader title="User Management" description={`${filtered.length} users in the current view`} />

        {/* Role counts — this table has no "status" field, so these reflect
            access level, which is the thing an admin actually manages here. */}
        <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <UserStatsCard label="Admins" value={String(counts.admin)} icon={ShieldCheck} hint="Full access" role="admin" />
          <UserStatsCard label="Managers" value={String(counts.manager)} icon={Briefcase} hint="Elevated access" role="manager" />
          <UserStatsCard label="Staff" value={String(counts.staff)} icon={UserCog} hint="Internal team" role="staff" />
          <UserStatsCard label="Customers" value={String(counts.customer)} icon={Users} hint="External accounts" role="customer" />
        </div>

        {/* Filters + search */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UserFilter value={filter} onChange={setFilter} />
          <UserSearch value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <UserList items={paginated} onSelect={setSelected} onEdit={handleEdit} />

        {/* Pagination */}
        <UserPagination page={current} pageCount={pageCount} onPageChange={setPage} />

        <UserDetailsSheet user={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
};

export default UsersPage;