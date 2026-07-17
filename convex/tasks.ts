import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("Todo"), v.literal("In Progress"), v.literal("Blocked"), v.literal("Done")
);
const priorityValidator = v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"));

const taskFields = {
  title: v.string(),
  description: v.string(),
  project: v.string(),
  assignee: v.string(),
  assigneeInitials: v.string(),
  tags: v.array(v.string()),
  status: statusValidator,
  priority: priorityValidator,
  due: v.string(),
  estimateHours: v.number(),
  subtasksTotal: v.number(),
  subtasksDone: v.number(),
  comments: v.number(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("tasks").order("desc").collect();
    return docs.map((d) => ({ id: d._id, ...d }));
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    return d ? { id: d._id, ...d } : null;
  },
});

export const create = mutation({
  args: taskFields,
  handler: async (ctx, args) => await ctx.db.insert("tasks", args),
});

export const update = mutation({
  args: { id: v.id("tasks"), ...taskFields },
  handler: async (ctx, { id, ...fields }) => { await ctx.db.patch(id, fields); },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});