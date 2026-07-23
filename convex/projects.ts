import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, requireUserId, getMyCustomerRecord } from "./lib/authz";

const statusValidator = v.union(
  v.literal("Planning"),
  v.literal("In Progress"),
  v.literal("On Hold"),
  v.literal("Completed"),
  v.literal("Cancelled")
);

const priorityValidator = v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"));

const projectFields = {
  name: v.string(),
  client: v.string(),
  owner: v.string(),
  team: v.array(v.string()),
  tags: v.array(v.string()),
  status: statusValidator,
  priority: priorityValidator,
  progress: v.number(),
  budget: v.number(),
  spent: v.number(),
  tasksTotal: v.number(),
  tasksDone: v.number(),
  due: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const docs = await ctx.db.query("projects").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

/**
 * Customer-portal project monitoring — returns only the projects whose
 * `client` matches the signed-in customer's company (or contact name),
 * so a customer can watch progress on their own work without ever seeing
 * the full internal project list.
 */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const customer = await getMyCustomerRecord(ctx);
    if (!customer) return [];
    const docs = await ctx.db.query("projects").order("desc").collect();
    return docs
      .filter((d) => d.client === customer.company || d.client === customer.name)
      .map((d) => ({ id: d._id, ...d }));
  },
});

/** Single-project detail for the customer portal, with the same ownership check as listMine. */
export const getMine = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const customer = await getMyCustomerRecord(ctx);
    if (!customer) return null;
    const d = await ctx.db.get(id);
    if (!d || (d.client !== customer.company && d.client !== customer.name)) return null;
    return { id: d._id, ...d };
  },
});

export const create = mutation({
  args: projectFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireRole(ctx, ["admin", "manager", "staff"]);
    return await ctx.db.insert("projects", { ...args, createdBy: userId });
  },
});

export const update = mutation({
  args: { id: v.id("projects"), ...projectFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, ["admin", "manager", "staff"]);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // Deletes are restricted to admins and managers.
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.delete(id);
  },
});