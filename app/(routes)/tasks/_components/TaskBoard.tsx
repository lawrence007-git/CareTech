"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  MessageSquare,
  CheckSquare,
  Flag,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  TASK_COLUMN_ACCENT,
  TASK_COLUMN_ACCENT_SOLID,
  TASK_PRIORITY_CLASS,
  TASK_STATUSES,
  TASK_OVERDUE_CLASS,
  daysUntil,
  hashAvatarColor,
  type Task,
} from "@/lib/types/tasks";

const MENU_WIDTH = 176; // matches w-44

interface MenuPosition {
  id: string;
  bottom: number;
  left: number;
}

export function TaskBoard({
  items,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: Task[];
  onSelect: (t: Task) => void;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
}) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Task | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const closeIfOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-task-menu]")) setOpenMenu(null);
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

  useEffect(() => {
    if (!confirmTarget) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirmTarget(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmTarget]);

  const toggleMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenu?.id === id) return setOpenMenu(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setOpenMenu({ id, bottom: window.innerHeight - rect.top + 6, left });
  };

  const activeItem = openMenu ? items.find((t) => t.id === openMenu.id) ?? null : null;

  const menuActions = activeItem && [
    {
      label: "View",
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      cls: "text-foreground",
      onClick: () => {
        setOpenMenu(null);
        onSelect(activeItem);
      },
    },
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4 text-primary" />,
      cls: "text-foreground",
      onClick: () => {
        setOpenMenu(null);
        onEdit?.(activeItem);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      cls: "text-destructive hover:bg-destructive/10",
      onClick: () => {
        setOpenMenu(null);
        setConfirmTarget(activeItem);
      },
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {TASK_STATUSES.map((status) => {
        const col = items.filter((t) => t.status === status);
        return (
          <div key={status} className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-surface-2 shadow-sm">
            <div className={`flex items-center justify-between rounded-t-xl bg-gradient-to-b ${TASK_COLUMN_ACCENT[status]} px-3 py-2.5`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${TASK_COLUMN_ACCENT_SOLID[status]}`} />
                <h3 className="text-sm font-semibold">{status}</h3>
              </div>
              <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {col.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {col.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">
                  Drop tasks here
                </div>
              )}
              {col.map((t, i) => {
                const days = daysUntil(t.due);
                const overdue = days < 0 && t.status !== "Done";
                return (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelect(t);
                    }}
                    className="group relative w-full cursor-pointer rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <span className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${TASK_COLUMN_ACCENT_SOLID[status]}`} />
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`line-clamp-2 text-sm font-medium group-hover:text-primary ${
                          t.status === "Done" ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {t.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        {t.priority !== "Low" && <Flag className={`h-3 w-3 ${TASK_PRIORITY_CLASS[t.priority]}`} />}
                        <div className="group/actions relative">
                          <button
                            type="button"
                            data-task-menu
                            onClick={(e) => toggleMenu(t.id, e)}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 ${
                              openMenu?.id === t.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/60 bg-surface-2 text-muted-foreground"
                            }`}
                            aria-haspopup="menu"
                            aria-expanded={openMenu?.id === t.id}
                            aria-label={`Actions for ${t.title}`}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full right-0 z-20 mb-1.5 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/actions:opacity-100"
                          >
                            Actions
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{t.project}</p>

                    {t.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-[width] duration-500 ${TASK_COLUMN_ACCENT_SOLID[status]}`}
                        style={{ width: `${t.subtasksTotal > 0 ? (t.subtasksDone / t.subtasksTotal) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                          <CheckSquare className="h-2.5 w-2.5" />
                          {t.subtasksDone}/{t.subtasksTotal}
                        </span>
                        {t.comments > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <MessageSquare className="h-2.5 w-2.5" /> {t.comments}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-0.5 tabular-nums ${overdue ? TASK_OVERDUE_CLASS : ""}`}>
                          <CalendarDays className="h-2.5 w-2.5" />
                          {overdue ? `${Math.abs(days)}d over` : `${days}d`}
                        </span>
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full text-[8px] font-semibold text-white ${hashAvatarColor(t.assignee)}`}
                        >
                          {t.assigneeInitials}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {openMenu && activeItem && menuActions && createPortal(
        <div
          data-task-menu
          role="menu"
          style={{ bottom: openMenu.bottom, left: openMenu.left }}
          className="fixed z-50 w-44 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
        >
          {menuActions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                a.onClick();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${a.cls}`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>,
        document.body,
      )}

      {confirmTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmTarget(null)} aria-hidden />
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-task-title" className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 id="delete-task-title" className="text-sm font-semibold text-foreground">
                  Delete &quot;{confirmTarget.title}&quot;?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will remove the task from {confirmTarget.project}. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete?.(confirmTarget);
                  setConfirmTarget(null);
                }}
                className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-white hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}