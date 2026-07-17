import type { LucideIcon } from "lucide-react";
import { ListChecks, Activity, AlertOctagon, CheckCircle2 } from "lucide-react";
import { TASK_STATUS_CLASS, type TaskStatus } from "@/lib/types/tasks";
import { StatsCard } from "../../_components/StatsCard";

interface TaskStatsCardProps {
  label: string;
  value: string;
  hint?: string;
  /**
   * When provided, badge + value color come from TASK_STATUS_CLASS, same
   * as TaskList/TaskGrid/TaskBoard/TaskDetailsSheet. Omit for an aggregate
   * stat (e.g. total open tasks) not tied to one status.
   */
  status?: TaskStatus;
  icon?: LucideIcon;
}

const VALUE_TONE: Record<TaskStatus, string> = {
  Todo: "text-status-todo",
  "In Progress": "text-status-progress",
  Blocked: "text-status-blocked",
  Done: "text-status-done",
};

const DEFAULT_ICON: Record<TaskStatus, LucideIcon> = {
  Todo: ListChecks,
  "In Progress": Activity,
  Blocked: AlertOctagon,
  Done: CheckCircle2,
};

export function TaskStatsCard({
  label,
  value,
  hint,
  status,
  icon,
}: TaskStatsCardProps) {
  return (
    <StatsCard
      label={label}
      value={value}
      hint={hint}
      icon={icon ?? (status ? DEFAULT_ICON[status] : ListChecks)}
      iconClassName={status ? TASK_STATUS_CLASS[status] : "bg-muted text-muted-foreground"}
      valueClassName={status ? VALUE_TONE[status] : "text-foreground"}
    />
  );
}