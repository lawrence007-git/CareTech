export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";

export interface Invoice {
  id: string;
  customer: string;
  customerId?: string;
  amount: string;
  status: InvoiceStatus;
  issued: string;
  due: string;
}

export const INVOICE_STATUS_CLASS: Record<InvoiceStatus, string> = {
  Paid: "bg-status-done/15 text-status-done",
  Pending: "bg-status-progress/15 text-status-progress",
  Overdue: "bg-status-blocked/15 text-status-blocked",
  Draft: "bg-status-todo/15 text-status-todo",
};

export const INVOICE_STATUSES: InvoiceStatus[] = ["Paid", "Pending", "Overdue", "Draft"];

export const INVOICE_STATUS_ACCENT: Record<InvoiceStatus, string> = {
  Paid: "from-status-done/15 to-transparent",
  Pending: "from-status-progress/15 to-transparent",
  Overdue: "from-status-blocked/15 to-transparent",
  Draft: "from-status-todo/10 to-transparent",
};

export const INVOICE_STATUS_ACCENT_SOLID: Record<InvoiceStatus, string> = {
  Paid: "bg-status-done",
  Pending: "bg-status-progress",
  Overdue: "bg-status-blocked",
  Draft: "bg-status-todo",
};