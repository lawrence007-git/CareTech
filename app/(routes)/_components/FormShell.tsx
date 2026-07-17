import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export function FormShell({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>
      <div className="mt-3 mb-6">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        {children}
      </div>
    </div>
  );
}

export function FormActions({
  submitLabel,
  cancelHref,
  pending = false,
}: {
  submitLabel: string;
  cancelHref: string;
  pending?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-end gap-2 border-t border-border pt-5">
      <Link
        href={cancelHref}
        className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface active:scale-[0.98]"
      >
        Cancel
      </Link>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {submitLabel}
      </button>
    </div>
  );
}