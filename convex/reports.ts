import { query } from "./_generated/server";
import { requireRole } from "./lib/authz";

type ReportCategory = "Sales" | "Staff" | "Customer" | "Operations";
type ReportStatus = "Ready" | "Processing" | "Failed" | "Scheduled";

interface ReportRow {
  id: string;
  name: string;
  category: ReportCategory;
  period: string;
  date: string;
  status: ReportStatus;
  generated: string;
}

const BILLING_STATUS: Record<string, ReportStatus> = {
  Paid: "Ready",
  Pending: "Processing",
  Overdue: "Failed",
  Draft: "Scheduled",
};

const STAFF_STATUS: Record<string, ReportStatus> = {
  Active: "Ready",
  "On Leave": "Processing",
  Inactive: "Failed",
};

const CUSTOMER_STATUS: Record<string, ReportStatus> = {
  Active: "Ready",
  Prospect: "Scheduled",
  Inactive: "Processing",
  Churned: "Failed",
};

const PROJECT_STATUS: Record<string, ReportStatus> = {
  Completed: "Ready",
  "In Progress": "Processing",
  Planning: "Scheduled",
  "On Hold": "Processing",
  Cancelled: "Failed",
};

export const list = query({
  args: {},
  handler: async (ctx): Promise<ReportRow[]> => {
    await requireRole(ctx, ["admin", "manager", "staff"]);

    const [billing, staffs, customers, projects] = await Promise.all([
      ctx.db.query("billing").collect(),
      ctx.db.query("staffs").collect(),
      ctx.db.query("customers").collect(),
      ctx.db.query("projects").collect(),
    ]);

    const rows: ReportRow[] = [];

    for (const b of billing) {
      rows.push({
        id: `billing:${b._id}`,
        name: `Invoice — ${b.customer}`,
        category: "Sales",
        period: b.issued,
        date: b.issued,
        status: BILLING_STATUS[b.status] ?? "Processing",
        generated: b.due,
      });
    }

    for (const s of staffs) {
      rows.push({
        id: `staff:${s._id}`,
        name: `Staff Report — ${s.name}`,
        category: "Staff",
        period: s.joined,
        date: s.joined,
        status: STAFF_STATUS[s.status] ?? "Processing",
        generated: s.joined,
      });
    }

    for (const c of customers) {
      rows.push({
        id: `customer:${c._id}`,
        name: `Customer Report — ${c.name}`,
        category: "Customer",
        period: c.joined,
        date: c.joined,
        status: CUSTOMER_STATUS[c.status] ?? "Processing",
        generated: c.joined,
      });
    }

    for (const p of projects) {
      rows.push({
        id: `project:${p._id}`,
        name: `Project Report — ${p.name}`,
        category: "Operations",
        period: p.due,
        date: p.due,
        status: PROJECT_STATUS[p.status] ?? "Processing",
        generated: p.due,
      });
    }

    return rows.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});