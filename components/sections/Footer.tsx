"use client";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path d="M2 4h6v6H2zM8 8h6v6H8z" fill="currentColor" />
                </svg>
              </span>
              <span className="font-display text-sm font-bold tracking-tight">
                CareTech<span className="text-primary">/</span>Systems
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Business systems, designed and engineered. We connect operations,
              data, and people so teams move faster than their tools used to allow.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#approach" className="hover:text-primary">
                  Approach
                </a>
              </li>
              <li>
                <a href="#work" className="hover:text-primary">
                  Case studies
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Contact
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="mailto:hello@caretech.com" className="hover:text-primary">
                 Caretech@gmail.com
                </a>
              </li>
              <li className="text-muted-foreground">Lisbon · Remote</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {year} CareTech. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}