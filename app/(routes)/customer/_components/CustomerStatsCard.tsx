import type { LucideIcon } from "lucide-react";
import { StatsCard } from "../../_components/StatsCard";

type CustomerTone = "default" | "positive" | "danger";

const TONE_CLASSES: Record<CustomerTone, { icon: string; value: string }> = {
  default: { icon: "bg-muted text-muted-foreground", value: "text-foreground" },
  positive: { icon: "bg-primary-soft text-primary", value: "text-primary" },
  danger: { icon: "bg-destructive/10 text-destructive", value: "text-destructive" },
};

interface CustomerStatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: CustomerTone;
}

export function CustomerStatsCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
}: CustomerStatsCardProps) {
  const { icon: iconClassName, value: valueClassName } = TONE_CLASSES[tone];
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