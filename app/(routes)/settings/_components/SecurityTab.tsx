"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { KeyRound, LogOut, Loader2 } from "lucide-react";

export function SecurityTab({
  signInMethod,
}: {
  signInMethod: "Google" | "Email & password";
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Sign-in method</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            You sign in to CareTech with <span className="font-medium">{signInMethod}</span>.
            {signInMethod === "Email & password" &&
              " Use \u201cForgot password\u201d on the sign-in page to change it."}
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-sm font-medium text-foreground">Sign out</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          End your session on this device. You&apos;ll need to sign in again to access CareTech.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out
        </button>
      </div>
    </div>
  );
}