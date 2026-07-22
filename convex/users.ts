import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId, requireRole } from "./lib/authz";
import type { Doc } from "./_generated/dataModel";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Self-service profile update — anyone signed in can edit their own name.
 * No requireRole() here on purpose: editing your own display name isn't a
 * privileged action, just requireUserId() to make sure someone's signed in.
 */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const firstName = args.firstName?.trim() || undefined;
    const lastName = args.lastName?.trim() || undefined;
    const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    await ctx.db.patch(userId, { firstName, lastName, name });
  },
});

// ---------------------------------------------------------------------
// Admin user management (new)
// ---------------------------------------------------------------------

const ROLE = v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("customer"));

function toUserRow(u: Doc<"users">) {
  const name = u.name?.trim() || [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed user";
  return {
    id: u._id,
    name,
    email: u.email ?? "",
    role: u.role ?? "customer",
    // No custom `joined` field on the schema — every Convex document has a
    // built-in creation timestamp, used here instead.
    joined: new Date(u._creationTime).toISOString(),
    emailVerified: !!u.emailVerificationTime,
    // Additive: defaults to "not disabled" / "never signed in since this
    // shipped" for any row written before these fields existed.
    disabled: !!u.disabled,
    lastActiveAt: u.lastActiveAt ? new Date(u.lastActiveAt).toISOString() : null,
  };
}

/** Admin-only directory listing. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map(toUserRow);
  },
});

/** Admin-only single-user lookup, for the edit page. */
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin"]);
    const u = await ctx.db.get(id);
    return u ? toUserRow(u) : null;
  },
});

/**
 * Changes another user's role. Deliberately separate from `updateProfile`
 * above — that one is self-service and only touches your own name;
 * changing *anyone's* role (including your own, from the admin side) is a
 * privileged action and gated accordingly.
 */
export const updateRole = mutation({
  args: { id: v.id("users"), role: ROLE },
  handler: async (ctx, { id, role }) => {
    // requireRole() returns the acting user's full document, not just an ID.
    const actingUser = await requireRole(ctx, ["admin"]);

    // Prevent an admin from demoting their own account and leaving nobody
    // with admin access.
    if (actingUser._id === id && role !== "admin") {
      throw new Error("You can't remove your own admin role.");
    }

    await ctx.db.patch(id, { role });
  },
});

/**
 * Suspends or reactivates another user's account. Separate from
 * `updateRole` because "can sign in at all" and "what can they do once
 * they're in" are different privileges, even though both are admin-only.
 *
 * Enforcement of `disabled` actually happens in convex/auth.ts's
 * createOrUpdateUser, which runs on every sign-in — this mutation only
 * flips the flag it reads. See that file's comment for the important
 * caveat about verifying the throw there actually aborts sign-in.
 */
export const setDisabled = mutation({
  args: { id: v.id("users"), disabled: v.boolean() },
  handler: async (ctx, { id, disabled }) => {
    const actingUser = await requireRole(ctx, ["admin"]);

    // Same self-lockout shape as updateRole: don't let the last admin
    // standing suspend their own access and get permanently shut out. (An
    // admin CAN reactivate themselves if some other admin already
    // suspended them, since `disabled` here is the target value, not a
    // toggle — only blocking self -> disabled=true.)
    if (actingUser._id === id && disabled) {
      throw new Error("You can't disable your own account.");
    }

    await ctx.db.patch(id, { disabled });
  },
});

// No `create` or `remove` here on purpose:
//
// - CREATE: this table is owned by Convex Auth. A row inserted directly
//   here has no linked authAccounts credential, so it couldn't actually
//   sign in — it would just be a dead record that looks like a user.
//   Account creation belongs in the sign-up flow (convex/auth.ts), not an
//   admin form. Admin-initiated account creation would really be an
//   "invite" feature (generate a token, email a signup link) — a
//   meaningfully bigger feature than a form; happy to help separately.
//
// - REMOVE: hard-deleting a `users` row can orphan its authAccounts /
//   authSessions rows (owned by @convex-dev/auth, not shown in schema.ts).
//   `setDisabled` (above) is now the real way to revoke access without
//   that risk — demoting someone's role to "customer" only reduces what
//   they can do once signed in, but setDisabled actually blocks sign-in
//   itself.