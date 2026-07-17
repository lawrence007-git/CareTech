"use client";
import { useMemo, useState } from "react";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ReportCard } from "./ReportCard";
import { REPORT_STATUS_CLASS, CATEGORY_ICON, CATEGORY_COLOR, STATUS_COLOR, type ReportItem } from "@/lib/types/reports";

export type DrillFilter = { type: "category" | "status"; value: string } | null;

type SortKey = "name" | "category" | "period" | "status" | "generated";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const DATE_KEYS = new Set<SortKey>(["period", "generated"]);

function compareValues(a: ReportItem, b: ReportItem, key: SortKey) {
  if (DATE_KEYS.has(key)) {
    const da = new Date(a[key]).getTime();
    const db = new Date(b[key]).getTime();
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
  }
  return a[key].localeCompare(b[key]);
}

export function ReportTable({
  items,
  drill,
  onClearDrill,
  onSelect,
}: {
  items: ReportItem[];
  drill: DrillFilter;
  onClearDrill: () => void;
  onSelect: (r: ReportItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("generated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const drillFiltered = useMemo(() => {
    if (!drill) return items;
    return items.filter((r) => (drill.type === "category" ? r.category === drill.value : r.status === drill.value));
  }, [items, drill]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drillFiltered;
    return drillFiltered.filter((r) => [r.name, r.category, r.status, r.period].some((f) => f.toLowerCase().includes(q)));
  }, [drillFiltered, search]);

  const sorted = useMemo(() => {
    const copy = [...searched];
    copy.sort((a, b) => {
      const cmp = compareValues(a, b, sortKey);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [searched, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (column !== sortKey) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  }

  const columns: { key: SortKey; label: string; hideOnMobile?: boolean }[] = [
    { key: "name", label: "Report" },
    { key: "category", label: "Category" },
    { key: "period", label: "Period", hideOnMobile: true },
    { key: "status", label: "Status" },
    { key: "generated", label: "Generated", hideOnMobile: true },
  ];

  return (
    <ReportCard
      title="All reports"
      description={
        drill
          ? `Filtered by ${drill.type}: ${drill.value} — ${sorted.length} of ${items.length} reports`
          : `${sorted.length} report${sorted.length === 1 ? "" : "s"} matching the current filters`
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {drill && (
            <button
              onClick={onClearDrill}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {drill.value}
              <X className="h-3 w-3" />
            </button>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reports…"
              className="w-40 rounded-md border border-border bg-surface py-1.5 pl-8 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:w-56"
            />
          </div>
        </div>
      }
    >
      {sorted.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-1 text-center text-sm">
          <p className="font-medium text-foreground">No reports found</p>
          <p className="text-muted-foreground">
            {search ? "Try a different search term." : "Nothing matches the current filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="-mx-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 pb-2 font-medium ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}>
                      <button
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 hover:text-foreground ${col.key === sortKey ? "text-foreground" : ""}`}
                      >
                        {col.label}
                        <SortIcon column={col.key} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((r, i) => {
                  const Icon = CATEGORY_ICON[r.category];
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelect(r)}
                      style={{ boxShadow: `inset 3px 0 0 0 ${STATUS_COLOR[r.status]}` }}
                      className={`cursor-pointer transition-colors hover:bg-accent ${i % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ background: `color-mix(in srgb, ${CATEGORY_COLOR[r.category]} 15%, transparent)`, color: CATEGORY_COLOR[r.category] }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[r.category] }} />
                          {r.category}
                        </span>
                      </td>
                      <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{r.period}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${REPORT_STATUS_CLASS[r.status]}`}>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[r.status] }} />
                          {r.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{r.generated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-border pt-3 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-border bg-surface px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border p-1 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border p-1 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ReportCard>
  );
}