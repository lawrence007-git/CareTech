"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Building2,
  User,
  Tag,
  CalendarDays,
  DollarSign,
  ListChecks,
  Clock,
  PauseCircle,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from "lucide-react";
import { FormField, TextInput, Select } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import {
  PROJECT_STATUS_CLASS,
  PROJECT_PRIORITY_CLASS,
  PROJECT_STATUS_ACCENT_SOLID,
  daysUntil,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
} from "@/lib/types/projects";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { validatePersonName, validateRealisticName, validateRealisticDate, validateNumber, validateOptionalInteger, validateList, validateInitialsList, splitList, normalizeText, type Errors } from "@/lib/validation";

const STATUSES: ProjectStatus[] = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High"];

const STATUS_ICON: Record<ProjectStatus, typeof Clock> = {
  Planning: Clock,
  "In Progress": FolderKanban,
  "On Hold": PauseCircle,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

const PRIORITY_ICON: Record<ProjectPriority, typeof ArrowDown> = {
  Low: ArrowDown,
  Medium: ArrowRight,
  High: ArrowUp,
};

const AVATAR_COLORS = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4", "bg-avatar-5", "bg-avatar-6"];

function MiniProgressRing({ value }: { value: number }) {
  const size = 48;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="text-[10px] font-semibold tabular-nums">{value}%</span>
      </div>
    </div>
  );
}

type FieldName = "name" | "client" | "owner" | "due" | "budget" | "spent" | "tasksDone" | "tasksTotal" | "tags" | "team";
type FormValues = {
  name: string;
  client: string;
  customerId: string; // Id<"customers"> once a real customer is picked, "" if unset/legacy.
  owner: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  due: string;
  budget: string;
  spent: string;
  tasksDone: string;
  tasksTotal: string;
  tags: string;
  team: string;
};

function validate(values: FormValues): Errors<FieldName> {
  const errors: Errors<FieldName> = {
    name: validateRealisticName(values.name, "Project name") ?? undefined,
    client: values.client.trim() ? undefined : "Client is required.",
    owner: validatePersonName(values.owner, "Team leader") ?? undefined,
    due: validateRealisticDate(values.due, "Due date", { maxYearsAhead: 3 }) ?? undefined,
    budget: validateNumber(values.budget, "Budget", { allowZero: false, max: 25_000_000 }) ?? undefined,
    spent: values.spent.trim() ? validateNumber(values.spent, "Spent", { max: 25_000_000 }) ?? undefined : undefined,
    tasksDone: validateOptionalInteger(values.tasksDone, "Tasks done", { max: 2_000 }) ?? undefined,
    tasksTotal: validateOptionalInteger(values.tasksTotal, "Tasks total", { max: 2_000 }) ?? undefined,
    tags: validateList(values.tags, "Tag") ?? undefined,
    team: validateInitialsList(values.team, "Team") ?? undefined,
  };

  // Cross-field checks, only once the individual numbers are valid.
  if (!errors.budget && !errors.spent) {
    const budget = Number.parseFloat(values.budget);
    const spent = Number.parseFloat(values.spent || "0");
    if (spent > budget) errors.spent = "Spent can't exceed the budget.";
  }
  if (!errors.tasksDone && !errors.tasksTotal) {
    const done = Number.parseInt(values.tasksDone || "0", 10);
    const total = Number.parseInt(values.tasksTotal || "0", 10);
    if (done > total) errors.tasksDone = "Tasks done can't exceed the total.";
  }

  return errors;
}

export function ProjectForm({
  initial,
  projectId,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<Project>;
  projectId?: Id<"projects">;
  submitLabel: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const customers = useQuery(api.customers.list);
  const staffs = useQuery(api.staffs.list);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});

  const isEditing = Boolean(projectId);

  const [form, setForm] = useState<FormValues>({
    name: initial?.name ?? "",
    client: initial?.client ?? "",
    customerId: initial?.customerId ?? "",
    owner: initial?.owner ?? "",
    status: (initial?.status ?? "Planning") as ProjectStatus,
    priority: (initial?.priority ?? "Medium") as ProjectPriority,
    due: initial?.due ?? "",
    budget: initial?.budget ? String(initial.budget) : "",
    spent: initial?.spent ? String(initial.spent) : "",
    tasksDone: initial?.tasksDone ? String(initial.tasksDone) : "",
    tasksTotal: initial?.tasksTotal ? String(initial.tasksTotal) : "",
    tags: initial?.tags?.join(", ") ?? "",
    team: initial?.team?.join(", ") ?? "",
  });

  // New projects only offer Active/Prospect customers as a client, and only
  // Active staff as team leader; an already-saved value stays selectable
  // even if its status has since drifted.
  const clientOptions = useMemo(
    () => customers?.filter((c) => c.status === "Active" || c.status === "Prospect" || c.company === form.client),
    [customers, form.client],
  );
  const leaderOptions = useMemo(
    () => staffs?.filter((s) => s.status === "Active" || s.name === form.owner),
    [staffs, form.owner],
  );

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  // Client is a linked pair: picking a customer sets the display string
  // (client) and the real FK (customerId) together, so they can't drift apart.
  const setClient = (customerId: string) => {
    if (customerId === "__legacy__") return; // keep the existing unlinked client string as-is
    const company = customers?.find((c) => c.id === customerId)?.company ?? "";
    const next = { ...form, client: company, customerId };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const tags = useMemo(() => splitList(form.tags), [form.tags]);
  const team = useMemo(() => splitList(form.team), [form.team]);

  const tasksDoneNum = Number.parseInt(form.tasksDone, 10) || 0;
  const tasksTotalNum = Number.parseInt(form.tasksTotal, 10) || 0;
  const progress = tasksTotalNum > 0 ? Math.round((tasksDoneNum / tasksTotalNum) * 100) : 0;

  const budgetNum = Number.parseFloat(form.budget) || 0;
  const spentNum = Number.parseFloat(form.spent) || 0;
  const budgetPct = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;

  const days = form.due ? daysUntil(form.due) : null;
  const overdue = days !== null && days < 0 && form.status !== "Completed";

  const StatusIcon = STATUS_ICON[form.status];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setPending(true);
    const payload = {
      name: normalizeText(form.name),
      client: normalizeText(form.client),
      customerId: customers?.some((c) => c.id === form.customerId) ? (form.customerId as Id<"customers">) : undefined,
      owner: normalizeText(form.owner),
      status: isEditing ? form.status : ("Planning" as ProjectStatus),
      priority: form.priority,
      due: form.due,
      budget: budgetNum,
      spent: spentNum,
      tasksTotal: tasksTotalNum,
      tasksDone: tasksDoneNum,
      tags,
      team,
      progress,
    };
    try {
      if (projectId) {
        await updateProject({ id: projectId, ...payload });
      } else {
        await createProject(payload);
      }
      router.push(cancelHref);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Live project card preview */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className={`h-1.5 w-full ${PROJECT_STATUS_ACCENT_SOLID[form.status]}`} />
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full ${PROJECT_STATUS_ACCENT_SOLID[form.status]} opacity-10 blur-2xl`}
        />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">New</span>
                <span
                  className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_PRIORITY_CLASS[form.priority]}`}
                >
                  {form.priority}
                </span>
              </div>
              <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
                {form.name.trim() || "Untitled project"}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {form.client.trim() || "No client yet"}
                {form.owner.trim() && ` · ${form.owner}`}
              </p>
            </div>
            <MiniProgressRing value={progress} />
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" /> Tasks
              </div>
              <div className="mt-0.5 font-semibold tabular-nums">
                {tasksDoneNum}
                <span className="text-muted-foreground">/{tasksTotalNum || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" /> Budget
              </div>
              <div className="mt-0.5 font-semibold tabular-nums">{budgetNum > 0 ? `${budgetPct}%` : "—"}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {overdue ? "Overdue" : "Due"}
              </div>
              <div className={`mt-0.5 font-semibold tabular-nums ${overdue ? "text-overdue" : ""}`}>
                {days === null ? "—" : overdue ? `${Math.abs(days)}d` : `${days}d`}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {team.slice(0, 4).map((t, idx) => (
                <span
                  key={t + idx}
                  className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                >
                  {t}
                </span>
              ))}
              {team.length > 4 && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
                  +{team.length - 4}
                </span>
              )}
              {team.length === 0 && <span className="text-xs text-muted-foreground">No team yet</span>}
            </div>
            {isEditing && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_CLASS[form.status]}`}
              >
                <StatusIcon className="h-3 w-3" />
                {form.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Project name" htmlFor="name" icon={FolderKanban} className="sm:col-span-2" error={errors.name}>
          <TextInput id="name" required aria-invalid={!!errors.name} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Website relaunch" />
        </FormField>

        <FormField
          label="Client"
          htmlFor="client"
          icon={Building2}
          error={errors.client}
          hint={!errors.client && customers?.length === 0 ? "No customers on file yet — add one first." : undefined}
        >
          <Select id="client" required aria-invalid={!!errors.client} value={form.customerId} onChange={(e) => setClient(e.target.value)} disabled={!customers}>
            <option value="" disabled>{customers ? "Select a customer…" : "Loading customers…"}</option>
            {!form.customerId && form.client && <option value="__legacy__">{form.client} (legacy, not linked)</option>}
            {clientOptions?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}{c.status !== "Active" && c.status !== "Prospect" ? ` (${c.status})` : ""}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Team Leader" htmlFor="owner" icon={User} error={errors.owner}>
          <Select id="owner" required aria-invalid={!!errors.owner} value={form.owner} onChange={(e) => set("owner", e.target.value)} disabled={!staffs}>
            <option value="" disabled>{staffs ? "Select a team leader…" : "Loading staff…"}</option>
            {form.owner && staffs && !staffs.some((s) => s.name === form.owner) && <option value={form.owner}>{form.owner} (not on staff list)</option>}
            {leaderOptions?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}{s.status !== "Active" ? ` (${s.status})` : ""}
              </option>
            ))}
          </Select>
        </FormField>

        {isEditing && (
          <FormField label="Status" icon={StatusIcon} className="sm:col-span-2">
            <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const Icon = STATUS_ICON[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("status", s)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97] ${
                      active
                        ? `border-transparent ${PROJECT_STATUS_CLASS[s]}`
                        : "border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s}
                  </button>
                );
              })}
            </div>
          </FormField>
        )}

        <FormField label="Priority" className="sm:col-span-2">
          <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => {
              const Icon = PRIORITY_ICON[p];
              const active = form.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("priority", p)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                    active
                      ? `border-transparent ${PROJECT_PRIORITY_CLASS[p]}`
                      : "border-input bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {p}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Due date"
          htmlFor="due"
          icon={CalendarDays}
          hint={days === null ? undefined : overdue ? `${Math.abs(days)} days overdue` : `Due in ${days} days`}
          error={errors.due}
        >
          <TextInput id="due" type="date" required aria-invalid={!!errors.due} value={form.due} onChange={(e) => set("due", e.target.value)} />
        </FormField>

        <FormField label="Budget (USD)" htmlFor="budget" icon={DollarSign} error={errors.budget}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
            <TextInput id="budget" type="number" min={0.01} max={25_000_000} step="100" required aria-invalid={!!errors.budget} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="25000" className="pl-6" />
          </div>
        </FormField>

        <FormField label="Spent (USD)" htmlFor="spent" icon={DollarSign} hint={!errors.spent && budgetNum > 0 ? `${budgetPct}% of budget used` : undefined} error={errors.spent}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
            <TextInput id="spent" type="number" min={0} max={25_000_000} step="100" aria-invalid={!!errors.spent} value={form.spent} onChange={(e) => set("spent", e.target.value)} placeholder="8000" className="pl-6" />
          </div>
        </FormField>

        <FormField label="Tasks" icon={ListChecks} hint={!errors.tasksDone && tasksTotalNum > 0 ? `${progress}% complete` : undefined} error={errors.tasksDone ?? errors.tasksTotal}>
          <div className="flex items-center gap-2">
            <TextInput type="number" min={0} max={2_000} aria-label="Tasks completed" aria-invalid={!!(errors.tasksDone ?? errors.tasksTotal)} value={form.tasksDone} onChange={(e) => set("tasksDone", e.target.value)} placeholder="0" />
            <span className="text-sm text-muted-foreground">/</span>
            <TextInput type="number" min={0} max={2_000} aria-label="Tasks total" aria-invalid={!!(errors.tasksDone ?? errors.tasksTotal)} value={form.tasksTotal} onChange={(e) => set("tasksTotal", e.target.value)} placeholder="0" />
          </div>
        </FormField>

        <FormField label="Tags" htmlFor="tags" icon={Tag} hint={!errors.tags ? "Separate with commas" : undefined} error={errors.tags}>
          <TextInput id="tags" aria-invalid={!!errors.tags} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="design, frontend, q3" />
        </FormField>

        <FormField label="Team" htmlFor="team" icon={User} hint={!errors.team ? "Initials, separated by commas" : undefined} error={errors.team}>
          <TextInput id="team" aria-invalid={!!errors.team} value={form.team} onChange={(e) => set("team", e.target.value)} placeholder="LO, MR, JV" />
        </FormField>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending} />
    </form>
  );
}