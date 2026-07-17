// app/(routes)/_components/SidebarContext.tsx
"use client";

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";

type MobileContextType = {
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

type CollapsedContextType = {
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const MobileContext = createContext<MobileContextType | null>(null);
const CollapsedContext = createContext<CollapsedContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Stable function refs — prevents children from re-rendering due to new fn identity
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  const mobileValue = useMemo(
    () => ({ mobileOpen, openMobile, closeMobile }),
    [mobileOpen, openMobile, closeMobile]
  );

  const collapsedValue = useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed]
  );

  return (
    <MobileContext.Provider value={mobileValue}>
      <CollapsedContext.Provider value={collapsedValue}>
        {children}
      </CollapsedContext.Provider>
    </MobileContext.Provider>
  );
}

export function useMobileSidebar() {
  const ctx = useContext(MobileContext);
  if (!ctx) throw new Error("useMobileSidebar must be used inside SidebarProvider");
  return ctx;
}

export function useCollapsedSidebar() {
  const ctx = useContext(CollapsedContext);
  if (!ctx) throw new Error("useCollapsedSidebar must be used inside SidebarProvider");
  return ctx;
}