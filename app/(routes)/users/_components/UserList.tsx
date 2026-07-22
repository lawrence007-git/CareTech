"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, MoreHorizontal, BadgeCheck, Ban, RotateCcw } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  USER_ROLE_CLASS,
  USER_STATUS_CLASS,
  ROLE_LABEL,
  formatJoined,
  userStatus,
  type User,
} from "@/lib/types/users";

interface UserListProps {
  items: User[];
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
}

interface MenuPosition {
  id: string;
  bottom: number;
  left: number;
}

const MENU_WIDTH = 176; // matches w-44

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function UserList({ items, onSelect, onEdit }: UserListProps) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);
  const setDisabled = useMutation(api.users.setDisabled);
  // Per-row pending state so one suspend/reactivate click can't be double-fired
  // and other rows stay interactive while it's in flight.
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-user-menu]")) setOpenMenu(null);
    };
    const close = () => setOpenMenu(null);
    document.addEventListener("mousedown", closeIfOutside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openMenu]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No users match the current filters.
      </div>
    );
  }

  const toggleMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuError(null);
    if (openMenu?.id === id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(8, Math.min(centerX - MENU_WIDTH / 2, window.innerWidth - MENU_WIDTH - 8));
    setOpenMenu({ id, bottom: window.innerHeight - rect.top + 6, left });
  };

  const activeItem = openMenu ? items.find((u) => u.id === openMenu.id) ?? null : null;

  const handleToggleDisabled = async (user: User) => {
    setPendingId(user.id);
    setMenuError(null);
    try {
      await setDisabled({ id: user.id as Id<"users">, disabled: !user.disabled });
      setOpenMenu(null);
    } catch (err) {
      // Most likely the self-lockout guard in convex/users.ts, or the
      // requireRole() admin check. Surface it instead of failing silently —
      // this is the one action that can lock someone out.
      setMenuError(err instanceof Error ? err.message : "Couldn't update this user's status.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop */}
      <table className="hidden w-full text-sm sm:table">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((u) => {
            const status = userStatus(u);
            return (
              <tr
                key={u.id}
                onClick={() => onSelect(u)}
                className="cursor-pointer bg-card transition-colors hover:bg-accent"
              >
                <td className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(u.name)}
                    </span>
                    {u.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    {u.email || <span className="italic">No email</span>}
                    {u.emailVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-status-done" aria-label="Verified" />}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${USER_ROLE_CLASS[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${USER_STATUS_CLASS[status]}`}>
                    {status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatJoined(u.joined)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      data-user-menu
                      onClick={(e) => toggleMenu(u.id, e)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                        openMenu?.id === u.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu?.id === u.id}
                      aria-label={`Actions for ${u.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-border sm:hidden">
        {items.map((u) => {
          const status = userStatus(u);
          return (
            <li key={u.id} className="bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => onSelect(u)} className="flex flex-1 items-start gap-2.5 text-left">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials(u.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium">{u.name}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${USER_ROLE_CLASS[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${USER_STATUS_CLASS[status]}`}>
                        {status}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{u.email || "No email"}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Joined {formatJoined(u.joined)}</p>
                  </div>
                </button>
                <button
                  type="button"
                  data-user-menu
                  onClick={(e) => toggleMenu(u.id, e)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                    openMenu?.id === u.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={openMenu?.id === u.id}
                  aria-label={`Actions for ${u.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {openMenu && activeItem && (
        <div
          data-user-menu
          role="menu"
          style={{ bottom: openMenu.bottom, left: openMenu.left }}
          className="fixed z-50 w-48 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(null);
              onSelect(activeItem);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Eye className="h-4 w-4 text-muted-foreground" /> View
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(null);
              onEdit(activeItem);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Pencil className="h-4 w-4 text-primary" /> Edit role
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={pendingId === activeItem.id}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDisabled(activeItem);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            {activeItem.disabled ? (
              <>
                <RotateCcw className="h-4 w-4 text-status-done" /> Reactivate
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 text-destructive" /> Suspend
              </>
            )}
          </button>
          {menuError && (
            <p className="border-t border-border px-3 py-2 text-xs text-destructive">{menuError}</p>
          )}
          {/* No "Remove" action — deliberately not implemented. Hard-deleting
              a Convex Auth users row risks orphaning authAccounts/authSessions
              rows this schema doesn't expose. Suspend (setDisabled) is the
              real way to cut off access; see convex/users.ts for reasoning. */}
        </div>
      )}
    </div>
  );
}