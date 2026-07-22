"use client";

import type { Role } from "@/lib/types/auth";
import { ShieldCheck, Shield, HeartPulse } from "lucide-react";

const ROLE_META: Record<
  Role,
  { label: string; clearance: 1 | 2 | 3 | 4; barClass: string; pillClass: string }
> = {
  customer: {
    label: "Customer",
    clearance: 1,
    barClass: "bg-muted-foreground/60",
    pillClass: "bg-muted text-muted-foreground",
  },
  staff: {
    label: "Staff",
    clearance: 2,
    barClass: "bg-status-done",
    pillClass: "bg-status-done/10 text-status-done",
  },
  manager: {
    label: "Manager",
    clearance: 3,
    barClass: "bg-status-planning",
    pillClass: "bg-status-planning/10 text-status-planning",
  },
  admin: {
    label: "Admin",
    clearance: 4,
    barClass: "bg-primary",
    pillClass: "bg-primary/10 text-primary",
  },
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

// Deterministic pseudo-random bar widths from a stable string (the user's
// _id), so each person's badge has a unique but stable "barcode."
function barcodeWidths(seed: string, count: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    widths.push(2 + (h % 5)); // 2–6px
  }
  return widths;
}

export function AccessBadge({
  name,
  email,
  image,
  role,
  memberSince,
}: {
  name: string;
  email?: string;
  image?: string;
  role: Role | null;
  memberSince: number;
}) {
  const meta = role ? ROLE_META[role] : ROLE_META.customer;
  const initials = initialsFor(name, email);
  const bars = barcodeWidths(email ?? name, 28);
  const joined = new Date(memberSince).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Badge clip / lanyard notch */}
      <div className="flex justify-center pt-3">
        <div className="h-2.5 w-16 rounded-full bg-border" />
      </div>

      <div className="flex flex-col items-center px-6 pb-5 pt-4 text-center">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <HeartPulse className="h-3 w-3 text-primary" />
          CareTech Access Badge
        </div>

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="mt-3 h-20 w-20 rounded-2xl object-cover ring-4 ring-primary-soft"
          />
        ) : (
          <div className="mt-3 grid h-20 w-20 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground ring-4 ring-primary-soft">
            {initials}
          </div>
        )}

        <h2 className="mt-3 max-w-full truncate text-lg font-semibold tracking-tight">
          {name}
        </h2>
        {email && (
          <p className="max-w-full truncate text-xs text-muted-foreground">{email}</p>
        )}

        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.pillClass}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {meta.label}
        </span>

        <div className="mt-5 w-full border-t border-dashed border-border pt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-3 w-3" /> Clearance level
            </span>
            <span className="font-medium text-foreground">{meta.clearance} / 4</span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full ${
                  level <= meta.clearance ? meta.barClass : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Member since</span>
            <span className="font-medium text-foreground">{joined}</span>
          </div>
        </div>
      </div>

      {/* Barcode stripe */}
      <div className="flex h-10 items-center justify-center gap-[2px] bg-foreground px-6">
        {bars.map((w, i) => (
          <span
            key={i}
            className="h-6 bg-background"
            style={{ width: `${w}px`, opacity: i % 7 === 0 ? 0.4 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}