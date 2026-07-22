"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAllowedRoles } from "@/lib/types/auth";

function GuardSkeleton() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { isLoading, isSignedIn, role } = useCurrentUser();

  const allowedRoles = getAllowedRoles(pathname);
  const isAllowed = !allowedRoles || (!!role && allowedRoles.includes(role));

  useEffect(() => {
    if (isLoading) return;

    if (!isSignedIn) {
      router.replace("/signin");
      return;
    }

    if (!isAllowed) {
      // No access-denied page — just bounce them straight back to a page
      // they ARE allowed to see, as if the route never existed for them.
      router.replace("/dashboard");
    }
  }, [isLoading, isSignedIn, isAllowed, router]);

  // Covers: still loading, not signed in (about to redirect), or not
  // allowed (about to redirect) — never render the protected content in
  // any of these states.
  if (isLoading || !isSignedIn || !isAllowed) {
    return <GuardSkeleton />;
  }

  return <>{children}</>;
}