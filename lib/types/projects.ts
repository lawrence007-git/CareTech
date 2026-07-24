export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High";

export interface Project {
  id: string;
  name: string;
  client: string;
  owner: string;
  team: string[];
  customerId?: string;  
  tags: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  budget: number;
  spent: number;
  tasksTotal: number;
  tasksDone: number;
  due: string;
}

export const PROJECT_STATUS_CLASS: Record<ProjectStatus, string> = {
  Planning: "bg-status-planning/15 text-status-planning",
  "In Progress": "bg-status-progress/15 text-status-progress",
  "On Hold": "bg-status-onhold/15 text-status-onhold",
  Completed: "bg-status-done/15 text-status-done",
  Cancelled: "bg-status-cancelled/15 text-status-cancelled",
};

export const PROJECT_PRIORITY_CLASS: Record<ProjectPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-status-progress/15 text-status-progress",
  High: "bg-destructive/15 text-destructive",
};

export const PROJECT_STATUSES: ProjectStatus[] = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];

export const PROJECT_STATUS_ACCENT: Record<ProjectStatus, string> = {
  Planning: "from-status-planning/10 to-transparent",
  "In Progress": "from-status-progress/15 to-transparent",
  "On Hold": "from-status-onhold/15 to-transparent",
  Completed: "from-status-done/15 to-transparent",
  Cancelled: "from-status-cancelled/15 to-transparent",
};

export const PROJECT_STATUS_ACCENT_SOLID: Record<ProjectStatus, string> = {
  Planning: "bg-status-planning",
  "In Progress": "bg-status-progress",
  "On Hold": "bg-status-onhold",
  Completed: "bg-status-done",
  Cancelled: "bg-status-cancelled",
};

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}