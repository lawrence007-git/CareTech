"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface BillingPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function BillingPagination({ page, pageCount, onPageChange }: BillingPaginationProps) {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(pageCount, page + 1));

  return (
    <nav className="flex items-center justify-between gap-2 pt-4">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of {pageCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={prev}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          type="button"
          onClick={next}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}