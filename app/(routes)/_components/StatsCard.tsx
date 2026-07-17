import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** classes for the icon's rounded badge, e.g. "bg-status-done/10 text-status-done" */
  iconClassName?: string;
  /** classes for the value text color, e.g. "text-status-done" */
  valueClassName?: string;
}

export function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  valueClassName = "text-foreground",
}: StatsCardProps) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
      <div
        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="pr-12 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClassName}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}