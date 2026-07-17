import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").order("desc").take(50);
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

/**
 * Task automation: scheduled once a day by convex/crons.ts. Rolls up anything
 * that would otherwise need someone to manually revisit the Reports page —
 * new failures, new customer/staff activity — into a single notification.
 *
 * Uses the same status mapping as convex/reports.ts, so "failed" here means
 * exactly what it means on the Reports page (Overdue billing, Cancelled
 * projects, etc).
 */
export const generateDailySummary = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const [billing, staffs, customers, projects] = await Promise.all([
      ctx.db.query("billing").collect(),
      ctx.db.query("staffs").collect(),
      ctx.db.query("customers").collect(),
      ctx.db.query("projects").collect(),
    ]);

    const newFailedBilling = billing.filter((b) => b.status === "Overdue" && b._creationTime >= oneDayAgo).length;
    const newFailedProjects = projects.filter((p) => p.status === "Cancelled" && p._creationTime >= oneDayAgo).length;
    const newCustomers = customers.filter((c) => c._creationTime >= oneDayAgo).length;
    const newStaff = staffs.filter((s) => s._creationTime >= oneDayAgo).length;

    const totalFailed = newFailedBilling + newFailedProjects;
    if (totalFailed === 0 && newCustomers === 0 && newStaff === 0) return;

    const parts: string[] = [];
    if (totalFailed > 0) parts.push(`${totalFailed} report(s) failed`);
    if (newCustomers > 0) parts.push(`${newCustomers} new customer report(s)`);
    if (newStaff > 0) parts.push(`${newStaff} new staff report(s)`);

    await ctx.db.insert("notifications", {
      title: "Daily reports summary",
      message: `${parts.join(", ")} in the last 24 hours.`,
      read: false,
    });
  },
});