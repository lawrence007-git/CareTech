import type { ReactNode } from "react";

export function CustomerCard({
  title,
  actions,
  children,
  className = "",
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          {title && <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}