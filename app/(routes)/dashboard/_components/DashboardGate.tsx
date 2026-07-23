"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { AdminDashboardView } from "./AdminDashboardView";
import { CustomerDashboard } from "./CustomerDashboardView";

// Same route (/dashboard) for everyone, different view per role: staff/
// managers/admins land on the internal ops console, customers land on
// their own portal home. RouteGuard already handles auth + access-rule
// redirects above this — this component only ever needs to pick a view.
export function DashboardGate() {
  const { isLoading, role } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return role === "customer" ? <CustomerDashboard /> : <AdminDashboardView />;
}