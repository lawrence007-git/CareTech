import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/authz";

const statusValidator = v.union(
  v.literal("Active"), v.literal("On Leave"), v.literal("Inactive")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const docs = await ctx.db.query("staffs").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("staffs") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: { name: v.string(), email: v.string(), status: statusValidator, joined: v.string() },
  handler: async (ctx, args) => {
    // Managing the staff roster is an admin/manager action — regular
    // staff can view their colleagues but not add or edit staff records.
    await requireRole(ctx, ["admin", "manager"]);
    return await ctx.db.insert("staffs", args);
  },
});

export const update = mutation({
  args: { id: v.id("staffs"), name: v.string(), email: v.string(), status: statusValidator, joined: v.string() },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("staffs") },
  handler: async (ctx, { id }) => {
    // Removing a staff member stays admin-only.
    await requireRole(ctx, ["admin"]);
    await ctx.db.delete(id);
  },
});