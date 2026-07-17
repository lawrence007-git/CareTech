import type { LucideIcon } from "lucide-react";
import { TrendingUp, Clock, AlertTriangle, Ban } from "lucide-react";
import { INVOICE_STATUS_CLASS, type InvoiceStatus } from "@/lib/types/billing";
import { StatsCard } from "../../_components/StatsCard";

interface BillingStatsCardProps {
  label: string;
  value: string;
  hint?: string;
  status: InvoiceStatus;
  icon?: LucideIcon;
}

const VALUE_TONE: Record<InvoiceStatus, string> = {
  Paid: "text-status-done",
  Pending: "text-status-progress",
  Overdue: "text-status-blocked",
  Draft: "text-status-todo",
};

const DEFAULT_ICON: Record<InvoiceStatus, LucideIcon> = {
  Paid: TrendingUp,
  Pending: Clock,
  Overdue: AlertTriangle,
  Draft: Ban,
};

export function BillingStatsCard({
  label,
  value,
  hint,
  status,
  icon,
}: BillingStatsCardProps) {
  return (
    <StatsCard
      label={label}
      value={value}
      hint={hint}
      icon={icon ?? DEFAULT_ICON[status]}
      iconClassName={INVOICE_STATUS_CLASS[status]}
      valueClassName={VALUE_TONE[status]}
    />
  );
}