"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { INVOICE_STATUS_CLASS, type Invoice } from "@/lib/types/billing";

interface BillingListProps {
  items: Invoice[];
  onSelect: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

interface MenuPosition {
  id: string;
  bottom: number;
  left: number;
}

const MENU_WIDTH = 176; // matches w-44

export function BillingList({ items, onSelect, onEdit, onDelete }: BillingListProps) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-billing-menu]")) setOpenMenu(null);
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
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No invoices match the current filters.
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

  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!confirmTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmTarget(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmTarget]);

  const handleDelete = (invoice: Invoice) => {
    setOpenMenu(null);
    setConfirmTarget(invoice);
  };

  const confirmDelete = () => {
    if (confirmTarget) onDelete(confirmTarget);
    setConfirmTarget(null);
  };

  const activeItem = openMenu ? items.find((i) => i.id === openMenu.id) ?? null : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      {/* Desktop */}
      <table className="hidden w-full text-sm sm:table">
        <thead className="bg-muted text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Issued</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((i) => (
            <tr
              key={i.id}
              onClick={() => onSelect(i)}
              className="cursor-pointer bg-card text-card-foreground transition-colors hover:bg-accent/50"
            >
              <td className="px-4 py-3 font-medium">{i.id}</td>
              <td className="px-4 py-3">{i.customer}</td>
              <td className="px-4 py-3 text-muted-foreground">{i.issued}</td>
              <td className="px-4 py-3 text-muted-foreground">{i.due}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_CLASS[i.status]}`}
                >
                  {i.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-display font-semibold">{i.amount}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    data-billing-menu
                    onClick={(e) => toggleMenu(i.id, e)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                      openMenu?.id === i.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu?.id === i.id}
                    aria-label={`Actions for invoice ${i.id}`}
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
        {items.map((i) => (
          <li key={i.id} className="bg-card px-4 py-4 text-card-foreground">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onSelect(i)} className="flex-1 text-left">
                <p className="text-sm font-semibold">{i.id}</p>
                <p className="text-xs text-muted-foreground">{i.customer}</p>
              </button>
              <div className="flex items-start gap-2">
                <div className="text-right">
                  <p className="font-display text-sm font-semibold">{i.amount}</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${INVOICE_STATUS_CLASS[i.status]}`}
                  >
                    {i.status}
                  </span>
                </div>
                <button
                  type="button"
                  data-billing-menu
                  onClick={(e) => toggleMenu(i.id, e)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted ${
                    openMenu?.id === i.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={openMenu?.id === i.id}
                  aria-label={`Actions for invoice ${i.id}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>Issued</dt>
                <dd className="text-foreground">{i.issued}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Due</dt>
                <dd className="text-foreground">{i.due}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {openMenu && activeItem && (
        <div
          data-billing-menu
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
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-status-blocked transition-colors hover:bg-status-blocked/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      {confirmTarget &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setConfirmTarget(null)}
              aria-hidden
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-invoice-title"
              className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-blocked/10 text-status-blocked">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 id="delete-invoice-title" className="text-sm font-semibold text-foreground">
                    Delete invoice {confirmTarget.id}?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This will remove {confirmTarget.customer}&rsquo;s invoice for {confirmTarget.amount}. This
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
                  className="rounded-md bg-status-blocked px-3 py-2 text-sm font-medium text-white hover:bg-status-blocked/90"
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