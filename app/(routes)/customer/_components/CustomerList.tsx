"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { CUSTOMER_STATUS_CLASS, type Customer } from "@/lib/types/customers";

interface CustomerListProps {
  items: Customer[];
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

interface MenuPosition {
  id: string;
  bottom: number;
  left: number;
}

const MENU_WIDTH = 176; // matches w-44

export function CustomerList({ items, onSelect, onEdit, onDelete }: CustomerListProps) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-customer-menu]")) setOpenMenu(null);
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

  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null);

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
        No customers match the current filters.
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

  const handleDelete = (customer: Customer) => {
    setOpenMenu(null);
    setConfirmTarget(customer);
  };

  const confirmDelete = () => {
    if (confirmTarget) onDelete(confirmTarget);
    setConfirmTarget(null);
  };

  const activeItem = openMenu ? items.find((c) => c.id === openMenu.id) ?? null : null;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop */}
      <table className="hidden w-full text-sm sm:table">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Lifetime value</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="cursor-pointer bg-card transition-colors hover:bg-accent"
            >
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
              <td className="px-4 py-3">{c.plan}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${CUSTOMER_STATUS_CLASS[c.status]}`}>
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{c.lifetimeValue}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    data-customer-menu
                    onClick={(e) => toggleMenu(c.id, e)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                      openMenu?.id === c.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu?.id === c.id}
                    aria-label={`Actions for ${c.name}`}
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
        {items.map((c) => (
          <li key={c.id} className="bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onSelect(c)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${CUSTOMER_STATUS_CLASS[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.company} · {c.email}
                </p>
              </button>
              <button
                type="button"
                data-customer-menu
                onClick={(e) => toggleMenu(c.id, e)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                  openMenu?.id === c.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-haspopup="menu"
                aria-expanded={openMenu?.id === c.id}
                aria-label={`Actions for ${c.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {openMenu && activeItem && (
        <div
          data-customer-menu
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
              aria-labelledby="delete-customer-title"
              className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 id="delete-customer-title" className="text-sm font-semibold text-foreground">
                    Delete {confirmTarget.name}?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This will remove {confirmTarget.name}&rsquo;s customer record for {confirmTarget.company}. This
                    action cannot be undone.
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