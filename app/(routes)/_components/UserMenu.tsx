"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hidden h-9 items-center gap-2 rounded-md border border-border bg-surface pl-1 pr-3 sm:flex"
        aria-label="Account menu"
      >
        <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
          JP
        </div>
        <div className="text-left text-sm leading-tight">
          <div className="font-medium">Joelle Park</div>
          <div className="text-xs text-muted-foreground">Admin</div>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-border bg-popover py-1 text-sm shadow-lg">
          <Link href="/settings" className="block px-3 py-2 hover:bg-accent">
            Profile settings
          </Link>
          <Link href="/sign-in" className="block px-3 py-2 hover:bg-accent">
            Sign out
          </Link>
        </div>
      )}
    </div>
  );
}
