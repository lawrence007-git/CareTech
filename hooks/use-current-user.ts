"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Role } from "@/lib/types/auth";

export function useCurrentUser() {
  const user = useQuery(api.users.current);

  return {
    // undefined = still loading, null = not signed in, object = signed in
    user,
    isLoading: user === undefined,
    isSignedIn: user !== undefined && user !== null,
    role: (user?.role ?? null) as Role | null,
  };
}