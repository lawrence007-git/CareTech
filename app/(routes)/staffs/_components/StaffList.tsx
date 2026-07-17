"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { STAFF_STATUS_CLASS, type Staff } from "@/lib/types/staffs";

interface StaffListProps {
  items: Staff[];
  onSelect: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

interface MenuPosition {
  id: string;
  bottom: number;
  left: number;
}

const MENU_WIDTH = 176; // matches w-44

export function StaffList({ items, onSelect, onEdit, onDelete }: StaffListProps) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-staff-menu]")) setOpenMenu(null);
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

  const [confirmTarget, setConfirmTarget] = useState<Staff | null>(null);

  useEffect(() => {
    if (!confirmTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmTarget(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmTarget]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No staff match the current filters.
      </div>
    );
  }

  const toggleMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenu?.id === id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(8, Math.min(centerX - MENU_WIDTH / 2, window.innerWidth - MENU_WIDTH - 8));
    setOpenMenu({ id, bottom: window.innerHeight - rect.top + 6, left });
  };

  const handleDelete = (staff: Staff) => {
    setOpenMenu(null);
    setConfirmTarget(staff);
  };

  const confirmDelete = () => {
    if (confirmTarget) onDelete(confirmTarget);
    setConfirmTarget(null);
  };

  const activeItem = openMenu ? items.find((s) => s.id === openMenu.id) ?? null : null;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop */}
      <table className="hidden w-full text-sm sm:table">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="cursor-pointer bg-card transition-colors hover:bg-accent"
            >
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STAFF_STATUS_CLASS[s.status]}`}>
                  {s.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.joined}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    data-staff-menu
                    onClick={(e) => toggleMenu(s.id, e)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                      openMenu?.id === s.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu?.id === s.id}
                    aria-label={`Actions for ${s.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-border sm:hidden">
        {items.map((s) => (
          <li key={s.id} className="bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onSelect(s)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${STAFF_STATUS_CLASS[s.status]}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{s.email}</p>
              </button>
              <button
                type="button"
                data-staff-menu
                onClick={(e) => toggleMenu(s.id, e)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                  openMenu?.id === s.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-haspopup="menu"
                aria-expanded={openMenu?.id === s.id}
                aria-label={`Actions for ${s.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {openMenu && activeItem && (
        <div
          data-staff-menu
          role="menu"
          style={{ bottom: openMenu.bottom, left: openMenu.left }}
          className="fixed z-50 w-44 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
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
            <Pencil className="h-4 w-4 text-primary" /> Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(activeItem);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      {confirmTarget &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmTarget(null)} aria-hidden />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-staff-title"
              className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 id="delete-staff-title" className="text-sm font-semibold text-foreground">
                    Remove {confirmTarget.name}?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This will remove {confirmTarget.name} from staff. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-white hover:bg-destructive/90"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}