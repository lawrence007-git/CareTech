import {
  TrendingUp,
  Users,
  UserCheck,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { ReportRangeValue } from "@/app/(routes)/reports/_components/ReportPeriodFilter";

// ── Types ──────────────────────────────────────────────
export type ReportCategory = "Sales" | "Staff" | "Customer" | "Operations";
export type ReportStatus = "Ready" | "Processing" | "Failed" | "Scheduled";
export type ReportFilterValue = "All" | ReportCategory;

export interface ReportItem {
  id: string;
  name: string;
  category: ReportCategory;
  period: string;
  date: string;
  status: ReportStatus;
  generated: string;
}

// ── Status badge classes ───────────────────────────────
export const REPORT_STATUS_CLASS: Record<ReportStatus, string> = {
  Ready: "bg-status-done/10 text-status-done",
  Processing: "bg-status-progress/10 text-status-progress",
  Failed: "bg-status-blocked/10 text-status-blocked",
  Scheduled: "bg-status-onhold/10 text-status-onhold",
};

// ── Chart colors ────────────────────────────────────────
export const CATEGORY_COLOR: Record<ReportCategory, string> = {
  Sales: "var(--status-done)",
  Staff: "var(--status-progress)",
  Customer: "var(--primary)",
  Operations: "var(--status-onhold)",
};

export const STATUS_COLOR: Record<ReportStatus, string> = {
  Ready: "var(--status-done)",
  Processing: "var(--status-progress)",
  Scheduled: "var(--status-onhold)",
  Failed: "var(--status-blocked)",
};

// ── Category icons ──────────────────────────────────────
export const CATEGORY_ICON: Record<ReportCategory, LucideIcon> = {
  Sales: TrendingUp,
  Staff: Users,
  Customer: UserCheck,
  Operations: Settings2,
};

// ── Filter bar options ──────────────────────────────────
export const CATEGORY_OPTIONS: ReportFilterValue[] = [
  "All",
  "Sales",
  "Staff",
  "Customer",
  "Operations",
];

export const RANGE_OPTIONS: { value: ReportRangeValue; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];