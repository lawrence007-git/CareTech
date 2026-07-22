"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/custom/CareTechLogo";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAllowedRoles } from "@/lib/types/auth";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListChecks,
  Receipt,
  UserCog,
  ShieldCheck,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Module-level constant — created once, never recreated on render
const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/customer", label: "Customer", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/staffs", label: "Staff", icon: UserCog },
  { to: "/users", label: "Users", icon: ShieldCheck },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const NavLink = memo(function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.to}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={`group flex items-center gap-3 rounded-lg py-3 text-sm transition-colors ${
          collapsed ? "justify-center px-0" : "px-4"
        } ${
          active
            ? "bg-primary-soft font-medium text-primary-deep dark:text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </li>
  );
});

export const Sidebar = memo(function Sidebar({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const { role } = useCurrentUser();

  // Only recompute when pathname, collapsed, or role changes. Items whose
  // route the current role isn't allowed to visit (per ACCESS_RULES) are
  // dropped entirely — not shown, not disabled, just not there.
  const navWithActive = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        const allowedRoles = getAllowedRoles(item.to);
        return !allowedRoles || (!!role && allowedRoles.includes(role));
      }).map((item) => ({
        item,
        active: item.exact ? pathname === item.to : pathname.startsWith(item.to),
      })),
    [pathname, role]
  );

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex h-20 items-center gap-3 border-b border-border ${
          collapsed ? "justify-center px-2" : "px-6"
        }`}
      >
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-6">
          {navWithActive.map(({ item, active }) => (
            <NavLink
              key={item.to}
              item={item}
              active={active}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/signin"
          onClick={onNavigate}
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center gap-3 rounded-lg py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            collapsed ? "justify-center px-0" : "px-4"
          }`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Sign out"}
        </Link>
      </div>
    </aside>
  );
});