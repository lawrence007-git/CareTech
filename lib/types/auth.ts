// Mirrors the `role` union defined on the `users` table in convex/schema.ts.
// Keep these in sync — this is the client-side source of truth for what
// each role is allowed to see, matching the requireRole(...) calls already
// enforced server-side in convex/*.ts.
export type Role = "admin" | "manager" | "staff" | "customer";

export type AccessRule = {
  /** Path prefix, matched with pathname.startsWith(match). */
  match: string;
  roles: Role[];
};

// Order matters: first match wins, and more specific prefixes should come
// before the more general ones they overlap with (e.g. "/staffs/create"
// before "/staffs").
export const ACCESS_RULES: AccessRule[] = [
  // Staff creation/editing is admin+manager only, matching staffs.ts create/update.
  { match: "/staffs/create", roles: ["admin", "manager"] },
  { match: "/staffs/edit", roles: ["admin", "manager"] },
  { match: "/staffs", roles: ["admin", "manager"] },

  { match: "/billing", roles: ["admin", "manager"] },
  { match: "/customer", roles: ["admin", "manager"] },
  { match: "/projects", roles: ["admin", "manager", "staff"] },
  { match: "/reports", roles: ["admin", "manager", "staff"] },
  { match: "/tasks", roles: ["admin", "manager", "staff"] },
  { match: "/users", roles: ["admin"] },

  // Dashboard has no role restriction server-side yet — every signed-in
  // role can land here after sign-in.
  { match: "/dashboard", roles: ["admin", "manager", "staff", "customer"] },
];

/** Returns the allowed roles for a pathname, or null if the route isn't gated. */
export function getAllowedRoles(pathname: string): Role[] | null {
  const rule = ACCESS_RULES.find((r) => pathname.startsWith(r.match));
  return rule ? rule.roles : null;
}