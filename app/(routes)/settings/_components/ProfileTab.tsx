"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Loader2, Mail, User as UserIcon } from "lucide-react";
import { FormField, TextInput } from "../../_components/FormField";

export function ProfileTab({
  userId,
  firstName,
  lastName,
  email,
  signInMethod,
}: {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  signInMethod: "Google" | "Email & password";
}) {
  const updateProfile = useMutation(api.users.updateProfile);

  const [first, setFirst] = useState(firstName ?? "");
  const [last, setLast] = useState(lastName ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Keep local fields in sync if the underlying user doc changes elsewhere
  // (e.g. after a fresh sign-in in another tab).
  useEffect(() => {
    setFirst(firstName ?? "");
    setLast(lastName ?? "");
  }, [userId, firstName, lastName]);

  const dirty = first !== (firstName ?? "") || last !== (lastName ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    await updateProfile({ firstName: first, lastName: last });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName" icon={UserIcon}>
          <TextInput
            id="firstName"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Jordan"
            autoComplete="given-name"
          />
        </FormField>
        <FormField label="Last name" htmlFor="lastName" icon={UserIcon}>
          <TextInput
            id="lastName"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Rivera"
            autoComplete="family-name"
          />
        </FormField>
      </div>

      <FormField
        label="Email"
        htmlFor="email"
        icon={Mail}
        hint={`Signed in with ${signInMethod}. Email is managed by your sign-in provider and can't be edited here.`}
      >
        <TextInput id="email" value={email ?? ""} disabled readOnly />
      </FormField>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={!dirty || status === "saving"}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save changes
        </button>
        {status === "saved" && (
          <span className="text-xs font-medium text-status-done">Saved.</span>
        )}
        {status === "idle" && dirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>
    </form>
  );
}