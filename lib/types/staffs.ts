export type StaffStatus = "Active" | "On Leave" | "Inactive";

export interface Staff {
  id: string;
  name: string;
  email: string;
  status: StaffStatus;
  joined: string;
}



export const STAFF_STATUS_CLASS: Record<StaffStatus, string> = {
  Active: "bg-status-done/15 text-status-done",
  "On Leave": "bg-status-progress/15 text-status-progress",
  Inactive: "bg-status-todo/15 text-status-todo",
};

export const STAFF_STATUSES: StaffStatus[] = ["Active", "On Leave", "Inactive"];

export const STAFF_STATUS_ACCENT: Record<StaffStatus, string> = {
  Active: "from-status-done/15 to-transparent",
  "On Leave": "from-status-progress/15 to-transparent",
  Inactive: "from-status-todo/10 to-transparent",
};

export const STAFF_STATUS_ACCENT_SOLID: Record<StaffStatus, string> = {
  Active: "bg-status-done",
  "On Leave": "bg-status-progress",
  Inactive: "bg-status-todo",
};