import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";

export type Role = "admin" | "manager" | "staff" | "customer";

/**
 * Throws if no one is signed in. Returns the signed-in user's ID otherwise.
 * Use this at the top of any query/mutation that should require login.
 */
export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Not signed in.");
  }
  return userId;
}

/**
 * Throws unless the signed-in user's role is one of `roles`.
 * Returns the user's full document (handy if the caller needs more than the ID).
 *
 * Example: only admins and managers can delete a customer —
 *   await requireRole(ctx, ["admin", "manager"]);
 */
export async function requireRole(ctx: QueryCtx | MutationCtx, roles: Role[]) {
  const userId = await requireUserId(ctx);
  const user = await ctx.db.get(userId);
  if (!user || !user.role || !roles.includes(user.role as Role)) {
    throw new ConvexError("You don't have permission to do that.");
  }
  return user;
}

/**
 * Resolves the signed-in "customer"-role user to their row in the
 * `customers` table (matched by email), for every customer-portal query
 * that needs to scope data down to "stuff that belongs to me".
 *
 * Deliberately returns `null` instead of throwing when no matching
 * `customers` row exists yet (e.g. an account was created before sales
 * added the company to the CRM) — the portal should render a friendly
 * "not linked up yet" empty state instead of crashing, since this is a
 * data-linkage gap rather than an authorization failure.
 *
 * Still requires the "customer" role via requireRole(), so it throws for
 * anyone who shouldn't be calling customer-portal queries at all.
 */
export async function getMyCustomerRecord(ctx: QueryCtx | MutationCtx) {
  const user = await requireRole(ctx, ["customer"]);
  if (!user.email) return null;
  return await ctx.db
    .query("customers")
    .withIndex("email", (q) => q.eq("email", user.email!))
    .unique();
}