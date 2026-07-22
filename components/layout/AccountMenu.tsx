"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api";

function initialsFor(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

function AccountAvatarMenu() {
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);
  // Google's photo URL can occasionally 404/expire, or fail to load in dev
  // (CORS, hotlink protection, etc). If it fails, fall back to initials
  // instead of showing a broken image icon.
  const [imageFailed, setImageFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Reset the "failed" flag if the user's image URL itself changes (e.g.
  // they re-link Google and get a fresh photo).
  useEffect(() => {
    setImageFailed(false);
  }, [user?.image]);

  const label = user?.name || user?.email || "Account";
  const showImage = !!user?.image && !imageFailed;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          initialsFor(user?.name, user?.email)
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{label}</p>
            {user?.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function AccountMenu() {
  return (
    <>
      <AuthLoading>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </AuthLoading>
      <Unauthenticated>
        <Link
          href="/signin"
          className="hidden h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex"
        >
          Sign in
        </Link>
      </Unauthenticated>
      <Authenticated>
        <AccountAvatarMenu />
      </Authenticated>
    </>
  );
}