import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("Active"), v.literal("Prospect"), v.literal("Inactive"), v.literal("Churned")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("customers").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: { name: v.string(), email: v.string(), company: v.string(), phone: v.string(), plan: v.string(), status: statusValidator, joined: v.string(), lifetimeValue: v.string() },
  handler: async (ctx, args) => await ctx.db.insert("customers", args),
});

export const update = mutation({
  args: { id: v.id("customers"), name: v.string(), email: v.string(), company: v.string(), phone: v.string(), plan: v.string(), status: statusValidator, joined: v.string(), lifetimeValue: v.string() },
  handler: async (ctx, { id, ...fields }) => { await ctx.db.patch(id, fields); },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
}); 