"use client";
import { useEffect, useState } from "react";
import { X, Copy, Check, Download, Share2 } from "lucide-react";
import {
  REPORT_STATUS_CLASS,
  CATEGORY_ICON,
  CATEGORY_COLOR,
  type ReportItem,
  type ReportCategory,
} from "@/lib/types/reports";

const CATEGORY_BLURB: Record<ReportCategory, string> = {
  Sales: "Billing and revenue activity for this period.",
  Staff: "Team status and staffing activity.",
  Customer: "Customer account activity and lifecycle status.",
  Operations: "Project and delivery activity.",
};

function toCsvRow(report: ReportItem) {
  const header = ["Name", "Category", "Period", "Status", "Generated"];
  const row = [report.name, report.category, report.period, report.status, report.generated];
  return [header, row].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
}

export function ReportDetailsSheet({
  report,
  open,
  onClose,
}: {
  report: ReportItem | null;
  open: boolean;
  onClose: () => void;
}) {
  // Keep the last non-null report around so content doesn't blank out mid-close-transition.
  const [cached, setCached] = useState<ReportItem | null>(report);
  const [copied, setCopied] = useState<"id" | "summary" | null>(null);

  useEffect(() => {
    if (report) setCached(report);
  }, [report]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const data = report ?? cached;
  if (!data) return null;

  const Icon = CATEGORY_ICON[data.category];

  async function copyText(text: string, which: "id" | "summary") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard access can fail in insecure contexts or without permission — fail silently.
    }
  }

  function downloadCsv() {
    if (!data) return;
    const blob = new Blob([toCsvRow(data)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const summaryText = `${data.name} — ${data.category} — ${data.status} — period ${data.period}`;

  return (
    <div className={`fixed inset-0 z-50 flex ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`flex-1 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${CATEGORY_COLOR[data.category]} 15%, transparent)`, color: CATEGORY_COLOR[data.category] }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Report</p>
              <h2 className="text-lg font-semibold leading-tight">{data.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            {CATEGORY_BLURB[data.category]}
          </p>

          <div className="space-y-4">
            <Row label="Category" value={data.category} />
            <Row label="Period" value={data.period} />
            <Row label="Generated" value={data.generated} />
            <Row
              label="Status"
              value={
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${REPORT_STATUS_CLASS[data.status]}`}>{data.status}</span>
              }
            />
            <Row
              label="Report ID"
              value={
                <button
                  onClick={() => copyText(data.id, "id")}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  {data.id}
                  {copied === "id" ? <Check className="h-3 w-3 text-status-done" /> : <Copy className="h-3 w-3" />}
                </button>
              }
            />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <button
            onClick={() => copyText(summaryText, "summary")}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
          >
            {copied === "summary" ? <Check className="h-3.5 w-3.5 text-status-done" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied === "summary" ? "Copied" : "Copy summary"}
          </button>
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" /> Download CSV
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}