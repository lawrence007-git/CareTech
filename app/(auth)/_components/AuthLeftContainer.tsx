import type { ReactNode } from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { AuthSidePanel } from "./AuthSidePanel";

export function AuthSplitShell({
  title,
  subtitle,
  children,
  footer,
  variant = "signin",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "signin" | "signup";
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <AuthSidePanel variant={variant} />
      <div className="flex min-h-screen flex-col px-4 py-10 sm:px-8">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CareTech</span>
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}