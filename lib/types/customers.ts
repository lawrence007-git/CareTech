export type CustomerStatus = "Active" | "Prospect" | "Inactive" | "Churned";

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  plan: string;
  status: CustomerStatus;
  joined: string;
  lifetimeValue: string;
}

export const CUSTOMER_STATUS_CLASS: Record<CustomerStatus, string> = {
  Active: "bg-status-done/15 text-status-done",
  Prospect: "bg-status-progress/15 text-status-progress",
  Inactive: "bg-status-todo/15 text-status-todo",
  Churned: "bg-status-blocked/15 text-status-blocked",
};

export const CUSTOMER_STATUSES: CustomerStatus[] = ["Active", "Prospect", "Inactive", "Churned"];

export const CUSTOMER_STATUS_ACCENT: Record<CustomerStatus, string> = {
  Active: "from-status-done/15 to-transparent",
  Prospect: "from-status-progress/15 to-transparent",
  Inactive: "from-status-todo/10 to-transparent",
  Churned: "from-status-blocked/15 to-transparent",
};

export const CUSTOMER_STATUS_ACCENT_SOLID: Record<CustomerStatus, string> = {
  Active: "bg-status-done",
  Prospect: "bg-status-progress",
  Inactive: "bg-status-todo",
  Churned: "bg-status-blocked",
};