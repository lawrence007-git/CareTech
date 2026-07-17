"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import {
  PROJECT_PRIORITY_CLASS,
  PROJECT_STATUS_ACCENT_SOLID,
  PROJECT_STATUS_CLASS,
  daysUntil,
  type Project,
} from "@/lib/types/projects";

const AVATAR_COLORS = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4", "bg-avatar-5", "bg-avatar-6"];
const MENU_WIDTH = 176; // matches w-44

interface MenuPosition { id: string; bottom: number; left: number }

const Avatar = ({ initials, index }: { initials: string; index: number }) => (
  <span
    className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
  >
    {initials}
  </span>
);

function ProgressRing({ value }: { value: number }) {
  const size = 56, stroke = 5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (value / 100) * c}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="text-xs font-semibold tabular-nums">{value}%</span>
      </div>
    </div>
  );
}

const STAT_ICONS = { tasks: CheckCircle2, budget: DollarSign, due: CalendarDays };

function Stat({ icon: Icon, label, value, danger }: { icon: any; label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-0.5 font-semibold tabular-nums ${danger ? "text-overdue" : ""}`}>{value}</div>
    </div>
  );
}

export function ProjectGrid({
  items, onSelect, onEdit, onDelete,
}: {
  items: Project[];
  onSelect: (p: Project) => void;
  onEdit?: (p: Project) => void;
  onDelete?: (p: Project) => void;
}) {
  const [openMenu, setOpenMenu] = useState<MenuPosition | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Project | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const closeIfOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-project-menu]")) setOpenMenu(null);
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

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No projects match the current filters.
      </div>
    );
  }

  const toggleMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenu?.id === id) return setOpenMenu(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setOpenMenu({ id, bottom: window.innerHeight - rect.top + 6, left });
  };

  const activeItem = openMenu ? items.find((p) => p.id === openMenu.id) ?? null : null;

  const menuActions = activeItem && [
    { label: "View", icon: <Eye className="h-4 w-4 text-muted-foreground" />, cls: "text-foreground", onClick: () => { setOpenMenu(null); onSelect(activeItem); } },
    { label: "Edit", icon: <Pencil className="h-4 w-4 text-primary" />, cls: "text-foreground", onClick: () => { setOpenMenu(null); onEdit?.(activeItem); } },
    { label: "Delete", icon: <Trash2 className="h-4 w-4" />, cls: "text-destructive hover:bg-destructive/10", onClick: () => { setOpenMenu(null); setConfirmTarget(activeItem); } },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((p, i) => {
        const days = daysUntil(p.due);
        const overdue = days < 0 && p.status !== "Completed";
        return (
          <article
            key={p.id}
            onClick={() => onSelect(p)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`h-1.5 w-full ${PROJECT_STATUS_ACCENT_SOLID[p.status]}`} />
            <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full ${PROJECT_STATUS_ACCENT_SOLID[p.status]} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25`} />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{p.id}</span>
                    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_PRIORITY_CLASS[p.priority]}`}>
                      {p.priority}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate text-base font-semibold tracking-tight group-hover:text-primary">{p.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.client} · {p.owner}</p>
                </div>
                <ProgressRing value={p.progress} />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
                <Stat icon={STAT_ICONS.tasks} label="Tasks" value={<>{p.tasksDone}<span className="text-muted-foreground">/{p.tasksTotal}</span></>} />
                <Stat icon={STAT_ICONS.budget} label="Budget" value={`${Math.round((p.spent / p.budget) * 100)}%`} />
                <Stat icon={STAT_ICONS.due} label={overdue ? "Overdue" : "Due"} value={overdue ? `${Math.abs(days)}d` : `${days}d`} danger={overdue} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.team.slice(0, 4).map((t, idx) => <Avatar key={t + idx} initials={t} index={idx} />)}
                  {p.team.length > 4 && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
                      +{p.team.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_CLASS[p.status]}`}>
                    {p.status}
                  </span>
                  <div className="group/actions relative">
                    <button
                      type="button"
                      data-project-menu
                      onClick={(e) => toggleMenu(p.id, e)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-all duration-200 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95 ${
                        openMenu?.id === p.id ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-surface-2 text-muted-foreground"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu?.id === p.id}
                      aria-label={`Actions for ${p.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full right-0 z-20 mb-1.5 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/actions:opacity-100"
                    >
                      Actions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {openMenu && activeItem && menuActions && createPortal(
        <div
          data-project-menu
          role="menu"
          style={{ bottom: openMenu.bottom, left: openMenu.left }}
          className="fixed z-50 w-44 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
        >
          {menuActions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); a.onClick(); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${a.cls}`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {confirmTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmTarget(null)} aria-hidden />
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title" className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 id="delete-project-title" className="text-sm font-semibold text-foreground">Delete {confirmTarget.name}?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will remove {confirmTarget.name} ({confirmTarget.client}) from your projects. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { onDelete?.(confirmTarget); setConfirmTarget(null); }}
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