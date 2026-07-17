import type { LucideIcon } from "lucide-react";
import { STAFF_STATUS_CLASS, type StaffStatus } from "@/lib/types/staffs";
import { StatsCard } from "../../_components/StatsCard";

type StaffStatTone = "default" | "accent";

interface StaffStatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /**
   * Pass the actual StaffStatus when this card represents a real status —
   * colors then come from STAFF_STATUS_CLASS, same as StaffList /
   * StaffDetailsSheet. Use `tone` only for non-status metrics like
   * Headcount or Open seats.
   */
  status?: StaffStatus;
  tone?: StaffStatTone;
}

const TONE_CLASSES: Record<StaffStatTone, { icon: string; value: string }> = {
  default: { icon: "bg-muted text-muted-foreground", value: "text-foreground" },
  accent: { icon: "bg-primary-soft text-primary", value: "text-primary" },
};

const STATUS_VALUE_TONE: Record<StaffStatus, string> = {
  Active: "text-status-done",
  "On Leave": "text-status-progress",
  Inactive: "text-status-todo",
};

export function StaffStatsCard({
  label,
  value,
  icon,
  hint,
  status,
  tone = "default",
}: StaffStatsCardProps) {
  const iconClassName = status ? STAFF_STATUS_CLASS[status] : TONE_CLASSES[tone].icon;
  const valueClassName = status ? STATUS_VALUE_TONE[status] : TONE_CLASSES[tone].value;

  return (
    <StatsCard
      label={label}
      value={value}
      hint={hint}
      icon={icon}
      iconClassName={iconClassName}
      valueClassName={valueClassName}
    />
  );
}