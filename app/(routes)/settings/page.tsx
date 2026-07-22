"use client";

import { useState } from "react";
import { User as UserIcon, ShieldCheck } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccessBadge } from "./_components/AccessBadge";
import { ProfileTab } from "./_components/ProfileTab";
import { SecurityTab } from "./_components/SecurityTab";
import type { Role } from "@/lib/types/auth";

type TabKey = "profile" | "security";

const TABS: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "security", label: "Security", icon: ShieldCheck },
];

function SettingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      <div className="h-[420px] animate-pulse rounded-2xl bg-surface" />
      <div className="h-[420px] animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const [tab, setTab] = useState<TabKey>("profile");

  if (isLoading || !user) {
    return (
      <section className="flex h-full w-full flex-col gap-4 p-6">
        <PageHeader
          title="Profile & settings"
          description="Manage how you appear and sign in across CareTech."
        />
        <SettingsSkeleton />
      </section>
    );
  }

  const displayName =
    user.name?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "CareTech user";
  const signInMethod: "Google" | "Email & password" = user.image ? "Google" : "Email & password";

  return (
    <section className="flex h-full w-full flex-col gap-4 p-6">
      <PageHeader
        title="Profile & settings"
        description="Manage how you appear and sign in across CareTech."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <AccessBadge
            name={displayName}
            email={user.email}
            image={user.image}
            role={(user.role ?? null) as Role | null}
            memberSince={user._creationTime}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex gap-1 border-b border-border p-2">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  tab === key
                    ? "bg-primary-soft text-primary-deep dark:text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "profile" ? (
              <ProfileTab
                userId={user._id}
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
                signInMethod={signInMethod}
              />
            ) : (
              <SecurityTab signInMethod={signInMethod} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}