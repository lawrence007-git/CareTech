// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="relative mb-8">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <HeartPulse className="h-10 w-10 text-black" strokeWidth={2.5} />
        </div>
        <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
          !
        </span>
      </div>

      <h1 className="text-6xl font-extrabold tracking-tight text-foreground">
        404
      </h1>

      <p className="mt-3 max-w-md text-lg font-semibold text-foreground">
        This page flatlined.
      </p>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back to a stable signal.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );
}