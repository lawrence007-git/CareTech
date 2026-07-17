"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../layout/ThemeToggle";
import { AccountMenu } from "../layout/AccountMenu";

const links = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path
                d="M2 4h6v6H2zM8 8h6v6H8z"
                fill="currentColor"
                opacity="0.95"
              />
            </svg>
          </span>
          <span className="font-display text-sm font-bold tracking-tight">
            CareTech<span className="text-primary">/</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-foreground hover:bg-surface"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
            >
              Go to Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}