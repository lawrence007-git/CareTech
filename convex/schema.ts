import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Custom users table: starts from Convex Auth's default fields and adds
  // `role`, populated from the sign-up form (see convex/auth.ts profile())
  // or defaulted to "customer" for OAuth sign-ups / account creation.
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
    // Additive fields for real Active/Suspended status + last-active
    // tracking (see lib/types/users.ts's old TODO for the full plan).
    // Both optional so existing rows (disabled === undefined,
    // lastActiveAt === undefined) read as "not disabled" / "never signed
    // in since this shipped" without a migration.
    disabled: v.optional(v.boolean()),
    lastActiveAt: v.optional(v.number()), // epoch ms, stamped in convex/auth.ts
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
    // Real FK to customers, set whenever the client is picked from the
    // dropdown. `client` stays as a denormalized display string (kept in
    // sync on write) so existing UI/reports don't need a rewrite, but
    // ownership checks (getMyCustomerRecord) now prefer this ID over the
    // string match wherever it's present.
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
    // Real FK, set when the project is picked from the dropdown. `project`
    // stays as a denormalized display string for existing UI/reports.
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
    // Real FK, set when the customer is picked from the dropdown. `customer`
    // stays as a denormalized display string for existing UI/reports.
    customerId: v.optional(v.id("customers")),
    amount: v.string(),
    status: v.union(v.literal("Paid"), v.literal("Pending"), v.literal("Overdue"), v.literal("Draft")),
    issued: v.string(),
    due: v.string(),
  }).index("customerId", ["customerId"]),

});