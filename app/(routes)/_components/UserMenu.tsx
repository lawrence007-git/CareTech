"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Role } from "@/lib/types/auth";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

function initialsFor(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { user, isLoading } = useCurrentUser();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/signin");
  };

  if (isLoading) {
    return (
      <div className="hidden h-9 w-32 animate-pulse rounded-md border border-border bg-surface sm:block" />
    );
  }

  if (!user) return null;

  const displayName =
    user.name?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "Signed in";
  const roleLabel = user.role ? ROLE_LABEL[user.role as Role] : "—";
  const initials = initialsFor(displayName, user.email);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hidden h-9 items-center gap-2 rounded-md border border-border bg-surface pl-1 pr-3 sm:flex"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-md object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
        )}
        <div className="text-left text-sm leading-tight">
          <div className="max-w-[9rem] truncate font-medium">{displayName}</div>
          <div className="text-xs text-muted-foreground">{roleLabel}</div>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-border bg-popover py-1 text-sm shadow-lg">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 hover:bg-accent"
          >
            Profile settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="block w-full px-3 py-2 text-left hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}