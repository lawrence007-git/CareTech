import type { LucideIcon } from "lucide-react";
import { StatsCard } from "../../_components/StatsCard";

type ReportTone = "default" | "info" | "warning" | "success";

const TONE_CLASSES: Record<ReportTone, { icon: string; value: string }> = {
  default: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  info: { icon: "bg-status-planning/10 text-status-planning", value: "text-status-planning" },
  warning: { icon: "bg-status-onhold/10 text-status-onhold", value: "text-status-onhold" },
  success: { icon: "bg-status-done/10 text-status-done", value: "text-status-done" },
};

interface ReportStatsCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: ReportTone;
  onClick?: () => void;
}

export function ReportStatsCard({ label, value, hint, icon, tone = "default", onClick }: ReportStatsCardProps) {
  const { icon: iconClassName, value: valueClassName } = TONE_CLASSES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left ${onClick ? "cursor-pointer transition-transform hover:-translate-y-0.5" : ""}`}
    >
      <StatsCard label={label} value={value} hint={hint} icon={icon} iconClassName={iconClassName} valueClassName={valueClassName} />
    </button>
  );
}