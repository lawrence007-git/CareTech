import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("Paid"), v.literal("Pending"), v.literal("Overdue"), v.literal("Draft")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("billing").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("billing") },
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: { customer: v.string(), amount: v.string(), status: statusValidator, issued: v.string(), due: v.string() },
  handler: async (ctx, args) => await ctx.db.insert("billing", args),
});

export const update = mutation({
  args: { id: v.id("billing"), customer: v.string(), amount: v.string(), status: statusValidator, issued: v.string(), due: v.string() },
  handler: async (ctx, { id, ...fields }) => { await ctx.db.patch(id, fields); },
});

export const remove = mutation({
  args: { id: v.id("billing") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});