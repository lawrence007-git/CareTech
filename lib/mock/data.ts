



export type ReportCategory = "Sales" | "Staff" | "Customer" | "Operations";
export type ReportStatus = "Ready" | "Processing" | "Failed" | "Scheduled";

export interface ReportItem {
  id: string;
  name: string;
  category: ReportCategory;
  period: string;   // display label, e.g. "June 2026"
  date: string;      // ISO date, drives filtering/grouping
  status: ReportStatus;
  generated: string;
}

export const REPORT_STATUS_CLASS: Record<ReportStatus, string> = {
  Ready: "bg-status-done/10 text-status-done",
  Processing: "bg-status-progress/10 text-status-progress",
  Failed: "bg-status-blocked/10 text-status-blocked",
  Scheduled: "bg-status-onhold/10 text-status-onhold",
};

export const REPORTS: ReportItem[] = [
  { id: "rep-001", name: "Monthly Sales Summary", category: "Sales", period: "Jun 2026", date: "2026-06-30", status: "Ready", generated: "Jul 1, 2026" },
  { id: "rep-002", name: "Staff Utilization Report", category: "Staff", period: "Jun 2026", date: "2026-06-28", status: "Ready", generated: "Jun 30, 2026" },
  { id: "rep-003", name: "Customer Retention Analysis", category: "Customer", period: "Jun 2026", date: "2026-06-25", status: "Processing", generated: "Jul 3, 2026" },
  { id: "rep-004", name: "Operations Cost Breakdown", category: "Operations", period: "Jul 2026", date: "2026-07-05", status: "Scheduled", generated: "Pending" },
  { id: "rep-005", name: "Weekly Sales Snapshot", category: "Sales", period: "Jul 2026", date: "2026-07-05", status: "Failed", generated: "Jul 5, 2026" },
  { id: "rep-006", name: "New Hires Overview", category: "Staff", period: "Jun 2026", date: "2026-06-15", status: "Ready", generated: "Jul 2, 2026" },
  { id: "rep-007", name: "Sales Pipeline Report", category: "Sales", period: "May 2026", date: "2026-05-20", status: "Ready", generated: "May 21, 2026" },
  { id: "rep-008", name: "Customer Churn Report", category: "Customer", period: "May 2026", date: "2026-05-10", status: "Ready", generated: "May 12, 2026" },
  { id: "rep-009", name: "Vendor Spend Analysis", category: "Operations", period: "May 2026", date: "2026-05-08", status: "Failed", generated: "May 9, 2026" },
  { id: "rep-010", name: "Payroll Summary", category: "Staff", period: "Apr 2026", date: "2026-04-30", status: "Ready", generated: "May 1, 2026" },
  { id: "rep-011", name: "Regional Sales Comparison", category: "Sales", period: "Apr 2026", date: "2026-04-18", status: "Ready", generated: "Apr 19, 2026" },
  { id: "rep-012", name: "Support Ticket Trends", category: "Customer", period: "Apr 2026", date: "2026-04-12", status: "Processing", generated: "Jul 4, 2026" },
];