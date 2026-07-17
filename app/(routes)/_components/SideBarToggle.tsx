"use client";

import { memo } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useMobileSidebar, useCollapsedSidebar } from "./SideBarContext";

export const SidebarToggle = memo(function SidebarToggle() {
  const { openMobile } = useMobileSidebar();
  const { collapsed, toggleCollapsed } = useCollapsedSidebar();

  return (
    <>
      <button
        onClick={openMobile}
        className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={toggleCollapsed}
        className="hidden h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:grid"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
    </>
  );
});