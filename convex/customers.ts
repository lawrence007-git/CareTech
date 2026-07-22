import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/authz";

const statusValidator = v.union(
  v.literal("Active"), v.literal("Prospect"), v.literal("Inactive"), v.literal("Churned")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const docs = await ctx.db.query("customers").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: { name: v.string(), email: v.string(), company: v.string(), phone: v.string(), plan: v.string(), status: statusValidator, joined: v.string(), lifetimeValue: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    return await ctx.db.insert("customers", args);
  },
});

export const update = mutation({
  args: { id: v.id("customers"), name: v.string(), email: v.string(), company: v.string(), phone: v.string(), plan: v.string(), status: statusValidator, joined: v.string(), lifetimeValue: v.string() },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    // Deletes are restricted to admins and managers — staff can create/edit but not remove.
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.delete(id);
  },
});