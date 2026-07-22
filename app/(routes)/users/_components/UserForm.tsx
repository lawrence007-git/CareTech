"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FormField } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import {
  USER_ROLE_CLASS,
  USER_ROLE_ICON,
  USER_ROLES,
  USER_STATUS_CLASS,
  ROLE_LABEL,
  userStatus,
  type User,
  type UserRole,
  type UserStatus,
} from "@/lib/types/users";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const STATUS_OPTIONS: UserStatus[] = ["Active", "Suspended"];

/**
 * Role + status (Active/Suspended). Still deliberately NOT name/email —
 * those come from the person's own sign-up/profile (see
 * convex/users.ts's updateProfile) and an admin form shouldn't bypass
 * that ownership boundary. Role and suspension are the two things an
 * admin actually manages here: what a user can do, and whether they can
 * sign in at all.
 */
export function UserRoleForm({
  user,
  currentUserId,
  cancelHref,
}: {
  user: User;
  /** The signed-in admin's own user ID — used only to grey out self-lockout options in the UI (the server enforces the real guards). */
  currentUserId?: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const updateRole = useMutation(api.users.updateRole);
  const setDisabled = useMutation(api.users.setDisabled);
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(userStatus(user));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = currentUserId === user.id;
  const wouldSelfDemote = isSelf && role !== "admin";
  const wouldSelfSuspend = isSelf && status === "Suspended";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      // Two independent mutations, each with their own server-side guard.
      // Only call the ones whose value actually changed, so an unrelated
      // edit (e.g. just the role) can't trip the *other* mutation's
      // self-lockout check for a value that isn't even changing.
      if (role !== user.role) {
        await updateRole({ id: user.id as Id<"users">, role });
      }
      const nextDisabled = status === "Suspended";
      if (nextDisabled !== user.disabled) {
        await setDisabled({ id: user.id as Id<"users">, disabled: nextDisabled });
      }
      router.push(cancelHref);
    } catch (err) {
      // The mutations throw a ConvexError for the self-lockout guards and
      // the requireRole() permission check — surface it rather than
      // failing silently.
      setError(err instanceof Error ? err.message : "Couldn't update this user.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {user.name
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("") || "?"}
          </div>
          <div>
            <p className="font-semibold leading-tight text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email || "No email on file"}</p>
          </div>
        </div>
      </div>

      <FormField label="Role">
        <div role="radiogroup" aria-label="Role" className="grid grid-cols-2 gap-2">
          {USER_ROLES.map((r) => {
            const Icon = USER_ROLE_ICON[r];
            const active = role === r;
            const blocked = isSelf && r !== "admin" && user.role === "admin";
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={blocked}
                onClick={() => setRole(r)}
                title={blocked ? "You can't remove your own admin role." : undefined}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? `border-transparent ${USER_ROLE_CLASS[r]}`
                    : "border-input bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {ROLE_LABEL[r]}
              </button>
            );
          })}
        </div>
      </FormField>

      {wouldSelfDemote && (
        <p className="flex items-start gap-2 rounded-lg border border-status-onhold/30 bg-status-onhold/10 px-3 py-2.5 text-xs text-status-onhold">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          You're changing your own account. If this removes your last admin, you'll be blocked from doing this
          again until another admin restores it.
        </p>
      )}

      <FormField label="Status" error={error ?? undefined}>
        <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((s) => {
            const active = status === s;
            const blocked = isSelf && s === "Suspended";
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={blocked}
                onClick={() => setStatus(s)}
                title={blocked ? "You can't suspend your own account." : undefined}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? `border-transparent ${USER_STATUS_CLASS[s]}`
                    : "border-input bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FormField>

      {wouldSelfSuspend && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          You can't suspend your own account — the server will reject this save.
        </p>
      )}

      <FormActions submitLabel="Save changes" cancelHref={cancelHref} pending={pending} />
    </form>
  );
}