import type { LucideIcon } from "lucide-react";
import { Clock, FolderKanban, PauseCircle, CheckCircle2, XCircle } from "lucide-react";
import { PROJECT_STATUS_CLASS, type ProjectStatus } from "@/lib/types/projects";
import { StatsCard } from "../../_components/StatsCard";

interface ProjectStatsCardProps {
  label: string;
  value: string;
  hint?: string;
  status: ProjectStatus;
  icon?: LucideIcon;
}

const VALUE_TONE: Record<ProjectStatus, string> = {
  Planning: "text-status-planning",
  "In Progress": "text-status-progress",
  "On Hold": "text-status-onhold",
  Completed: "text-status-done",
  Cancelled: "text-status-cancelled",
};

const DEFAULT_ICON: Record<ProjectStatus, LucideIcon> = {
  Planning: Clock,
  "In Progress": FolderKanban,
  "On Hold": PauseCircle,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

export function ProjectStatsCard({ label, value, hint, status, icon }: ProjectStatsCardProps) {
  return (
    <StatsCard
      label={label}
      value={value}
      hint={hint}
      icon={icon ?? DEFAULT_ICON[status]}
      iconClassName={PROJECT_STATUS_CLASS[status]}
      valueClassName={VALUE_TONE[status]}
    />
  );
}