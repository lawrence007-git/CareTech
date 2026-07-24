import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("staff"),
        v.literal("customer"),
      ),
    ),
    disabled: v.optional(v.boolean()),
    lastActiveAt: v.optional(v.number()), 
  }).index("email", ["email"]),

  customers: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.string(),
    phone: v.string(),
    plan: v.string(),
    status: v.union(v.literal("Active"), v.literal("Prospect"), v.literal("Inactive"), v.literal("Churned")),
    joined: v.string(),
    lifetimeValue: v.string(),
  }).index("email", ["email"]),

  staffs: defineTable({
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("Active"), v.literal("On Leave"), v.literal("Inactive")),
    joined: v.string(),
  }),

  projects: defineTable({
    name: v.string(),
    client: v.string(),
    customerId: v.optional(v.id("customers")),
    owner: v.string(),
    team: v.array(v.string()),
    tags: v.array(v.string()),
    status: v.union(v.literal("Planning"), v.literal("In Progress"), v.literal("On Hold"), v.literal("Completed"), v.literal("Cancelled")),
    priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    progress: v.number(),
    budget: v.number(),
    spent: v.number(),
    tasksTotal: v.number(),
    tasksDone: v.number(),
    due: v.string(),
    createdBy: v.optional(v.id("users")),
  }).index("customerId", ["customerId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    project: v.string(),
    projectId: v.optional(v.id("projects")),
    assignee: v.string(),
    assigneeInitials: v.string(),
    tags: v.array(v.string()),
    status: v.union(v.literal("Todo"), v.literal("In Progress"), v.literal("Blocked"), v.literal("Done")),
    priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    due: v.string(),
    estimateHours: v.number(),
    subtasksTotal: v.number(),
    subtasksDone: v.number(),
    comments: v.number(),
  }).index("projectId", ["projectId"]),

  billing: defineTable({
    customer: v.string(),
    customerId: v.optional(v.id("customers")),
    amount: v.string(),
    status: v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue"), v.literal("Draft")),
    issued: v.string(),
    due: v.string(),
  }).index("customerId", ["customerId"]),
  auditLogs: defineTable({
    actorId: v.id("users"),
    actorName: v.string(), // snapshot of the acting admin's name/email at the time, so the entry still reads sensibly if that admin is later renamed
    action: v.union(v.literal("role_change"), v.literal("suspend"), v.literal("reactivate")),
    targetUserId: v.id("users"),
    targetName: v.string(), // same snapshot reasoning as actorName
    fromValue: v.optional(v.string()),
    toValue: v.optional(v.string()),
  })
    .index("targetUserId", ["targetUserId"])
    .index("actorId", ["actorId"]),
});