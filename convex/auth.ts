import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { DataModel } from "./_generated/dataModel";

// Custom Password provider: pulls the extra sign-up fields (first/last name,
// role) out of the params sent from SignUpForm and writes them onto the
// users document. `profile` is called for every flow (signUp, signIn, etc.)
// so we only require the extra fields to be present — email/password are
// always there.
const CareTechPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: `${params.firstName ?? ""} ${params.lastName ?? ""}`.trim() || undefined,
      firstName: params.firstName as string | undefined,
      lastName: params.lastName as string | undefined,
      // The sign-up form no longer exposes a role picker — every new
      // password sign-up (and any OAuth sign-up, which never sends `role`
      // at all) defaults to "customer".
      role: (params.role as "admin" | "staff" | "customer" | undefined) ?? "customer",
    };
  },
  validatePasswordRequirements: (password: string) => {
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      throw new ConvexError("Password must be at least 8 characters and include a letter and a number.");
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CareTechPassword, Google],
});