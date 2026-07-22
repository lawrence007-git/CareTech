import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/authz";

const statusValidator = v.union(
  v.literal("Paid"), v.literal("Pending"), v.literal("Overdue"), v.literal("Draft")
);

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

export const create = mutation({
  args: { customer: v.string(), amount: v.string(), status: statusValidator, issued: v.string(), due: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    return await ctx.db.insert("billing", args);
  },
});

export const update = mutation({
  args: { id: v.id("billing"), customer: v.string(), amount: v.string(), status: statusValidator, issued: v.string(), due: v.string() },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("billing") },
  handler: async (ctx, { id }) => {
    // Deletes are restricted to admins and managers.
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.delete(id);
  },
});