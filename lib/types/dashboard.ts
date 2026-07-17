// Dashboard-only helpers, formatters, and design tokens.
// Anything here is used exclusively by dashboard components — domain data/types
// (tasks, projects, staff, invoices) stay owned by their own lib files and are
// only ever imported here, never redefined.

export type ActivityItem = {
  id: string;
  icon: import("lucide-react").LucideIcon;
  text: string;
  meta: string;
  date: Date;
  tone: string;
};

export type AgendaItem = {
  id: string;
  title: string;
  meta: string;
  due: string;
  kind: "task" | "project";
};

// Priority sort weight — shared by any dashboard widget that ranks by priority.
export const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const;

// Shared Recharts tooltip style — previously duplicated inline in RevenuePulse
// (and mirrors the one in the Reports module's charts).
export const CHART_TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

// Parses a currency-formatted string like "$1,234.56" into a number.
// Previously duplicated identically in KpiRow.tsx and RevenuePulse.tsx.
export function parseAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.-]/g, "")) || 0;
}

// Relative "time ago" label for the activity feed.
export function timeAgo(date: Date): string {
  const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `in ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

// Sortable month bucket key (e.g. 202607) so months order chronologically
// regardless of display label.
export function monthKey(iso: string): number {
  const d = new Date(iso);
  return d.getFullYear() * 100 + (d.getMonth() + 1);
}

// Display label for a month bucket, e.g. "Jul".
export function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short" });
}

// Deterministic pseudo-trend so each KPI card gets a believable sparkline
// without randomness (same seed → same shape every render).
export function sparkline(end: number, points = 7) {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const wiggle = Math.sin(i * 1.7 + end) * end * 0.06;
    const v = Math.max(0, Math.round(end * (0.5 + 0.5 * t) + wiggle));
    return { i, v };
  });
}

// Time-of-day greeting for the hero banner.
export function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}