"use client";

import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useMobileSidebar, useCollapsedSidebar } from "./SideBarContext";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function Topbar() {
  const { openMobile } = useMobileSidebar();
  const { collapsed, toggleCollapsed } = useCollapsedSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      {/* Mobile: opens the drawer */}
      <button
        type="button"
        onClick={openMobile}
        className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop: collapses/expands the sidebar */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="hidden h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-accent lg:grid"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <ThemeToggle />

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-accent"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}