"use client";

import { memo, type ReactNode } from "react";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";
import { SidebarProvider, useMobileSidebar, useCollapsedSidebar } from "./SideBarContext";

const MobileDrawer = memo(function MobileDrawer() {
  const { mobileOpen, closeMobile } = useMobileSidebar();
  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={closeMobile} />
      <div className="absolute inset-y-0 left-0">
        <Sidebar onNavigate={closeMobile} />
      </div>
    </div>
  );
});

const DesktopSidebar = memo(function DesktopSidebar() {
  const { collapsed } = useCollapsedSidebar();
  return (
    <div className="hidden lg:block">
      <Sidebar collapsed={collapsed} />
    </div>
  );
});

function ShellInner({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <DesktopSidebar />
      <MobileDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}