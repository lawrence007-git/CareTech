"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Download, ChevronDown, FileText, FileSpreadsheet, Table2 } from "lucide-react";
import type { ReportItem } from "@/lib/types/reports";

const FORMATS = [
  { key: "csv", label: "CSV", desc: "Raw rows, opens anywhere", icon: Table2 },
  { key: "excel", label: "Excel", desc: "Formatted workbook (.xlsx)", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF", desc: "Print-ready summary", icon: FileText },
] as const;

function toCsv(items: ReportItem[]) {
  const header = ["Name", "Category", "Period", "Status", "Generated"];
  const rows = items.map((r) => [r.name, r.category, r.period, r.status, r.generated]);
  return [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
}

export function ReportExport({ items }: { items: ReportItem[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.right - 224, width: rect.width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function handleExport(format: (typeof FORMATS)[number]["key"]) {
    setOpen(false);
    if (format === "csv") {
      const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // Excel/PDF: wire to your export endpoint (e.g. exceljs / jsPDF server-side).
    console.info(`Export as ${format}: connect to your export endpoint here.`);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <Download className="h-4 w-4" /> Export <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className="z-[100] w-56 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
          >
            <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Export {items.length} reports
            </p>
            {FORMATS.map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleExport(key)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{desc}</span>
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}