"use client";

import { X, BadgeCheck, ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import {
  USER_ROLE_CLASS,
  USER_STATUS_CLASS,
  ROLE_LABEL,
  formatJoined,
  formatLastActive,
  userStatus,
  type User,
} from "@/lib/types/users";

interface UserDetailsSheetProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsSheet({ user, open, onClose }: UserDetailsSheetProps) {
  if (!open || !user) return null;

  const status = userStatus(user);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">User</p>
            <h2 className="font-display text-lg font-semibold text-foreground">{user.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <Row label="Email" value={user.email || "—"} />
          <Row
            label="Email verified"
            value={
              user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-status-done">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <ShieldOff className="h-3.5 w-3.5" /> Unverified
                </span>
              )
            }
          />
          <Row
            label="Role"
            value={
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${USER_ROLE_CLASS[user.role]}`}>
                {ROLE_LABEL[user.role]}
              </span>
            }
          />
          <Row
            label="Status"
            value={
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${USER_STATUS_CLASS[status]}`}>
                {status}
              </span>
            }
          />
          <Row label="Joined" value={formatJoined(user.joined)} />
          <Row label="Last active" value={formatLastActive(user.lastActiveAt)} />
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}