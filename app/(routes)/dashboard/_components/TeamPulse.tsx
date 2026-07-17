"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { STAFF_STATUSES, STAFF_STATUS_ACCENT_SOLID, STAFF_STATUS_CLASS } from "@/lib/types/staffs";

export function TeamPulse() {
  const staffsQuery = useQuery(api.staffs.list);
  const isLoading = staffsQuery === undefined;
  const staffs = staffsQuery ?? [];

  const total = staffs.length || 1;
  const counts = STAFF_STATUSES.map((status) => ({
    status,
    count: staffs.filter((s) => s.status === status).length,
  }));
  const activeStaff = staffs.filter((s) => s.status === "Active").slice(0, 6);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Team pulse</h3>
        <Link href="/staffs" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Directory <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading team…</p>
      ) : (
        <>
          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {counts.map(
              ({ status, count }) =>
                count > 0 && (
                  <div
                    key={status}
                    className={STAFF_STATUS_ACCENT_SOLID[status]}
                    style={{ width: `${(count / total) * 100}%` }}
                    title={`${status}: ${count}`}
                  />
                )
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {counts.map(({ status, count }) => (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${STAFF_STATUS_CLASS[status]}`}
              >
                {status} · {count}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {activeStaff.map((s) => (
                <span
                  key={s.id}
                  title={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary-soft text-[11px] font-semibold text-primary-deep"
                >
                  {s.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">on shift today</span>
          </div>
        </>
      )}
    </section>
  );
}