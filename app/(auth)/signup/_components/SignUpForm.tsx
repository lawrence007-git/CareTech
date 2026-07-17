"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ConvexError } from "convex/values";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthField } from "../../_components/AuthField";
import { AuthSubmit } from "../../_components/AuthSubmit";
import { required, validateEmail, validatePassword, validateConfirm, type Errors } from "@/lib/validation";

type FieldName = "firstName" | "lastName" | "email" | "password" | "confirmPassword";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function validate(values: Values): Errors<FieldName> {
  return {
    firstName: required(values.firstName, "First name") ?? undefined,
    lastName: required(values.lastName, "Last name") ?? undefined,
    email: validateEmail(values.email, "Work email") ?? undefined,
    password: validatePassword(values.password) ?? undefined,
    confirmPassword: validateConfirm(values.confirmPassword, values.password) ?? undefined,
  };
}

export function SignUpForm() {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await signIn("password", {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: "customer",
        flow: "signUp",
      });
      // Convex Auth's signUp flow authenticates immediately — sign back out
      // so the person has to log in deliberately with the credentials they
      // just set, rather than landing in the app already authenticated.
      await signOut();
      router.push("/signin?created=1");
    } catch (err) {
      setFormError(
        err instanceof ConvexError
          ? err.data
          : "Couldn't create your account. That email may already be in use.",
      );
      setLoading(false);
    }
  }

  async function onGoogleSignUp() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      // Google is inherently "authenticate now" — there's no separate
      // create-then-sign-in step for OAuth, so this signs them straight in.
      await signIn("google", { redirectTo: "/" });
    } catch {
      setFormError("Couldn't start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onGoogleSignUp}
        disabled={googleLoading || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon className="h-4 w-4" />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            required
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
          />
          <AuthField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            required
            value={values.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>
        <AuthField
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
        />
        {!errors.password && (
          <p className="-mt-2 text-xs text-muted-foreground">
            At least 8 characters, with a letter and a number.
          </p>
        )}
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
        <AuthSubmit disabled={loading}>{loading ? "Creating account…" : "Create account"}</AuthSubmit>
      </form>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}