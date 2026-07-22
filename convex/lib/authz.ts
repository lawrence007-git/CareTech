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