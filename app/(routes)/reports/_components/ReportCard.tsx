import type { ReactNode } from "react";

export function ReportCard({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
          {title && (
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
          )}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}