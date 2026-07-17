export type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  assigneeInitials: string;
  tags: string[];
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  estimateHours: number;
  subtasksTotal: number;
  subtasksDone: number;
  comments: number;
}

export const TASK_STATUS_CLASS: Record<TaskStatus, string> = {
  Todo: "bg-status-todo/15 text-status-todo",
  "In Progress": "bg-status-progress/15 text-status-progress",
  Blocked: "bg-status-blocked/15 text-status-blocked",
  Done: "bg-status-done/15 text-status-done",
};

export const TASK_PRIORITY_CLASS: Record<TaskPriority, string> = {
  Low: "text-muted-foreground/40",
  Medium: "text-muted-foreground",
  High: "text-destructive",
};

export const TASK_PRIORITY_ACCENT: Record<TaskPriority, string> = {
  Low: "bg-muted-foreground/40",
  Medium: "bg-status-progress",
  High: "bg-destructive",
};

export const TASK_STATUSES: TaskStatus[] = ["Todo", "In Progress", "Blocked", "Done"];

export const TASK_COLUMN_ACCENT: Record<TaskStatus, string> = {
  Todo: "from-status-todo/10 to-transparent",
  "In Progress": "from-status-progress/15 to-transparent",
  Blocked: "from-status-blocked/15 to-transparent",
  Done: "from-status-done/15 to-transparent",
};

export const TASK_COLUMN_ACCENT_SOLID: Record<TaskStatus, string> = {
  Todo: "bg-status-todo",
  "In Progress": "bg-status-progress",
  Blocked: "bg-status-blocked",
  Done: "bg-status-done",
};

// Shared overdue tone — previously hardcoded as "text-rose-500" separately
// in TaskBoard, TaskList, and TaskForm.
export const TASK_OVERDUE_CLASS = "text-status-blocked";

// Shared assignee-avatar palette + hash function — previously duplicated
// (with slightly different color sets) in TaskBoard.tsx and TaskForm.tsx.
export const TASK_AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
];

export function hashAvatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TASK_AVATAR_COLORS[h % TASK_AVATAR_COLORS.length];
}

export function taskInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}