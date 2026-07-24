import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getMyCustomerRecord } from "./lib/authz";

const statusValidator = v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue"), v.literal("Draft"));

const billingFields = {
  customer: v.string(),
  customerId: v.optional(v.id("customers")),
  amount: v.string(),
  status: statusValidator,
  issued: v.string(),
  due: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const docs = await ctx.db.query("billing").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("billing") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

/**
 * Customer-portal invoice list — only this customer's own billing rows.
 * Prefers the real customerId FK; falls back to the old name/company
 * string match for invoices created before that field existed.
 */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const customer = await getMyCustomerRecord(ctx);
    if (!customer) return [];
    const docs = await ctx.db.query("billing").order("desc").collect();
    return docs
      .filter((d) => (d.customerId ? d.customerId === customer._id : d.customer === customer.name || d.customer === customer.company))
      .map((d) => ({ id: d._id, ...d }));
  },
});

export const create = mutation({
  args: billingFields,
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    return await ctx.db.insert("billing", args);
  },
});

export const update = mutation({
  args: { id: v.id("billing"), ...billingFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("billing") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.delete(id);
  },
});