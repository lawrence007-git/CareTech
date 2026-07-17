"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ConvexError } from "convex/values";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthField } from "../../_components/AuthField";
import { AuthSubmit } from "../../_components/AuthSubmit";
import { required, validateEmail, type Errors } from "@/lib/validation";

type FieldName = "email" | "password";

function validate(values: { email: string; password: string }): Errors<FieldName> {
  return {
    email: validateEmail(values.email) ?? undefined,
    // Sign-in only checks presence — password *complexity* rules belong at
    // sign-up time, not on every login attempt against an existing account.
    password: required(values.password, "Password") ?? undefined,
  };
}

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends FieldName>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    // Once the user has tried to submit, give live feedback as they fix fields.
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
        flow: "signIn",
      });
      // On success, ConvexAuthNextjsProvider updates auth state and the
      // middleware/route redirect (see middleware.ts) takes it from here.
    } catch (err) {
      setFormError(
        err instanceof ConvexError
          ? err.data
          : "Couldn't sign in. Check your email and password and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signIn("google");
    } catch {
      setFormError("Couldn't start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onGoogleSignIn}
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
        <AuthField
          label="Email"
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
          autoComplete="current-password"
          required
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-[color:var(--primary)]"
            />
            Remember me
          </label>
          <Link
            href="/reset-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <AuthSubmit disabled={loading}>{loading ? "Signing in…" : "Sign in"}</AuthSubmit>
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