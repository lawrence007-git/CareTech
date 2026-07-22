import { ShieldCheck, Briefcase, UserCog, Users as UsersIcon, type LucideIcon } from "lucide-react";
import type { Role } from "@/convex/lib/authz";

// Matches convex/schema.ts's real `users` table (Convex Auth-owned) exactly.
//
// `disabled` and `lastActiveAt` are now real fields (see schema.ts) — the
// enforcement lives in convex/auth.ts's createOrUpdateUser, and the toggle
// is convex/users.ts's setDisabled mutation. Status below is derived from
// `disabled` only; `lastActiveAt` is shown separately rather than folded
// into the status label, since "never active" and "suspended" are
// different facts an admin might want to see at the same time.

export type UserRole = Role; // "admin" | "manager" | "staff" | "customer"

export type UserStatus = "Active" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joined: string; // ISO date string, derived from Convex's built-in _creationTime
  emailVerified: boolean;
  disabled: boolean;
  /** ISO date string of last successful sign-in, or null if they never have (or signed up before this shipped). */
  lastActiveAt: string | null;
}

export const USER_ROLES: UserRole[] = ["admin", "manager", "staff", "customer"];

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

// Kept your original class choices for the roles you'd already styled;
// added `manager` to match, since the real schema has four roles, not three.
export const USER_ROLE_CLASS: Record<UserRole, string> = {
  admin: "bg-primary-soft text-primary",
  manager: "bg-status-onhold/15 text-status-onhold",
  staff: "bg-status-progress/15 text-status-progress",
  customer: "bg-muted text-muted-foreground",
};

export const USER_ROLE_ICON: Record<UserRole, LucideIcon> = {
  admin: ShieldCheck,
  manager: Briefcase,
  staff: UserCog,
  customer: UsersIcon,
};

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  Active: "bg-status-done/15 text-status-done",
  Suspended: "bg-destructive/15 text-destructive",
};

export function userStatus(u: Pick<User, "disabled">): UserStatus {
  return u.disabled ? "Suspended" : "Active";
}

export function formatJoined(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Same formatting as formatJoined, but handles "never signed in" explicitly. */
export function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}