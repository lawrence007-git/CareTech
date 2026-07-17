import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("Active"), v.literal("On Leave"), v.literal("Inactive")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("staffs").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("staffs") },
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: { name: v.string(), email: v.string(), status: statusValidator, joined: v.string() },
  handler: async (ctx, args) => await ctx.db.insert("staffs", args),
});

export const update = mutation({
  args: { id: v.id("staffs"), name: v.string(), email: v.string(), status: statusValidator, joined: v.string() },
  handler: async (ctx, { id, ...fields }) => { await ctx.db.patch(id, fields); },
});

export const remove = mutation({
  args: { id: v.id("staffs") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});