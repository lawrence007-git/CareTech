"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  FolderKanban,
  User,
  Tag,
  CalendarDays,
  CheckSquare,
  Flag,
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { FormField, TextInput, Select } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import {
  TASK_STATUS_CLASS,
  TASK_PRIORITY_CLASS,
  TASK_COLUMN_ACCENT_SOLID,
  TASK_STATUSES,
  TASK_OVERDUE_CLASS,
  daysUntil,
  hashAvatarColor,
  taskInitials,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/types/tasks";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { validatePersonName, validateRealisticName, validateRealisticDate, validateOptionalNumber, validateOptionalInteger, validateList, splitList, normalizeText, type Errors } from "@/lib/validation";

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

const STATUS_ICON: Record<TaskStatus, typeof ListChecks> = {
  Todo: ListChecks,
  "In Progress": Activity,
  Blocked: AlertOctagon,
  Done: CheckCircle2,
};

type FieldName = "title" | "project" | "assignee" | "due" | "estimateHours" | "subtasksDone" | "subtasksTotal" | "tags";
type FormValues = {
  title: string;
  description: string;
  project: string;
  projectId: string; // Id<"projects"> once a real project is picked, "" if unset/legacy.
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  tags: string;
  estimateHours: string;
  subtasksDone: string;
  subtasksTotal: string;
  comments: number;
};

function validate(values: FormValues): Errors<FieldName> {
  const errors: Errors<FieldName> = {
    // Titles can legitimately include digits ("Fix bug #42"), so only
    // block values with no letters at all.
    title: validateRealisticName(values.title, "Title") ?? undefined,
    project: values.project.trim() ? undefined : "Project is required.",
    // Assignee is a person — reject digits/symbols masquerading as a name,
    // since this renders as avatar initials elsewhere.
    assignee: validatePersonName(values.assignee, "Assignee") ?? undefined,
    // Task Flow, the agenda timeline, and the board all compute "days until
    // due" / "overdue" off this — a mis-picked year produces a meaningless
    // countdown wherever it's shown.
    due: validateRealisticDate(values.due, "Due date", { maxYearsAhead: 2 }) ?? undefined,
    // Estimates are realistically fractional (e.g. 2.5h) — this now allows
    // decimals (previously forced whole numbers only), while still catching
    // an absurd typo like "5000" hours on a single task.
    estimateHours: values.estimateHours.trim()
      ? validateOptionalNumber(values.estimateHours, "Estimate", { min: 0, max: 500 }) ?? undefined
      : undefined,
    subtasksDone: validateOptionalInteger(values.subtasksDone, "Subtasks done", { max: 200 }) ?? undefined,
    subtasksTotal: validateOptionalInteger(values.subtasksTotal, "Subtasks total", { max: 200 }) ?? undefined,
    tags: validateList(values.tags, "Tag") ?? undefined,
  };

  if (!errors.subtasksDone && !errors.subtasksTotal) {
    const done = Number.parseInt(values.subtasksDone || "0", 10);
    const total = Number.parseInt(values.subtasksTotal || "0", 10);
    if (done > total) errors.subtasksDone = "Subtasks done can't exceed the total.";
  }

  return errors;
}

export function TaskForm({
  initial,
  taskId,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<Task>;
  taskId?: Id<"tasks">;
  submitLabel: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  // Picking from real records instead of free-typing: a mistyped project
  // name here would silently orphan the task (it just wouldn't show up
  // under that project anywhere), and a mistyped assignee breaks the
  // avatar-initials lookup used across the board/list views.
  const projects = useQuery(api.projects.list);
  const staffs = useQuery(api.staffs.list);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});

  const isEditing = Boolean(taskId);

  const [form, setForm] = useState<FormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    project: initial?.project ?? "",
    projectId: initial?.projectId ?? "",
    assignee: initial?.assignee ?? "",
    status: (initial?.status ?? "Todo") as TaskStatus,
    priority: (initial?.priority ?? "Medium") as TaskPriority,
    due: initial?.due ?? "",
    tags: initial?.tags?.join(", ") ?? "",
    estimateHours: initial?.estimateHours ? String(initial.estimateHours) : "",
    subtasksDone: initial?.subtasksDone ? String(initial.subtasksDone) : "",
    subtasksTotal: initial?.subtasksTotal ? String(initial.subtasksTotal) : "",
    comments: initial?.comments ?? 0,
  });

  // A new task shouldn't default to a Completed/Cancelled project (nothing
  // should still be landing there) or a non-Active assignee. Still allow
  // whatever's already saved on this record (edit mode) to stay selected
  // even if it's since moved out of the "normally pickable" set.
  const OPEN_PROJECT_STATUSES = ["Planning", "In Progress", "On Hold"];
  const projectOptions = useMemo(
    () => projects?.filter((p) => OPEN_PROJECT_STATUSES.includes(p.status) || p.name === form.project),
    [projects, form.project],
  );
  const assigneeOptions = useMemo(
    () => staffs?.filter((s) => s.status === "Active" || s.name === form.assignee),
    [staffs, form.assignee],
  );

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  // Project is a linked pair: picking one sets the display string (project)
  // and the real FK (projectId) together.
  const setProject = (projectId: string) => {
    if (projectId === "__legacy__") return; // keep the existing unlinked project string as-is
    const name = projects?.find((p) => p.id === projectId)?.name ?? "";
    const next = { ...form, project: name, projectId };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const tags = useMemo(() => splitList(form.tags), [form.tags]);
  const doneNum = Number.parseInt(form.subtasksDone, 10) || 0;
  const totalNum = Number.parseInt(form.subtasksTotal, 10) || 0;
  const pct = totalNum > 0 ? Math.round((doneNum / totalNum) * 100) : 0;
  const estimateNum = Number.parseFloat(form.estimateHours) || 0;

  const days = form.due ? daysUntil(form.due) : null;
  const overdue = days !== null && days < 0 && form.status !== "Done";

  const StatusIcon = STATUS_ICON[form.status];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setPending(true);
    const payload = {
      title: normalizeText(form.title),
      description: form.description.trim(),
      project: normalizeText(form.project),
      projectId: projects?.some((p) => p.id === form.projectId) ? (form.projectId as Id<"projects">) : undefined,
      assignee: normalizeText(form.assignee),
      assigneeInitials: taskInitials(form.assignee),
      status: isEditing ? form.status : ("Todo" as TaskStatus),
      priority: form.priority,
      due: form.due,
      estimateHours: estimateNum,
      subtasksTotal: totalNum,
      subtasksDone: doneNum,
      comments: form.comments,
      tags,
    };
    try {
      if (taskId) {
        await updateTask({ id: taskId, ...payload });
      } else {
        await createTask(payload);
      }
      router.push(cancelHref);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Live task card preview */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
        <span className={`absolute left-0 top-0 h-full w-1 ${TASK_COLUMN_ACCENT_SOLID[form.status]}`} />
        <div className="flex items-start justify-between gap-2 pl-2">
          <p
            className={`line-clamp-2 text-sm font-medium ${
              form.status === "Done" ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {form.title.trim() || "Untitled task"}
          </p>
          {form.priority !== "Low" && (
            <Flag className={`h-3.5 w-3.5 shrink-0 ${TASK_PRIORITY_CLASS[form.priority]}`} />
          )}
        </div>
        <p className="mt-0.5 pl-2 text-xs text-muted-foreground">{form.project.trim() || "No project yet"}</p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 pl-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-[width] duration-500 ${TASK_COLUMN_ACCENT_SOLID[form.status]}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between pl-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <CheckSquare className="h-3 w-3" />
              {doneNum}/{totalNum}
            </span>
            <span className={`inline-flex items-center gap-1 tabular-nums ${overdue ? TASK_OVERDUE_CLASS : ""}`}>
              <CalendarDays className="h-3 w-3" />
              {days === null ? "—" : overdue ? `${Math.abs(days)}d over` : `${days}d`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${TASK_STATUS_CLASS[form.status]}`}
              >
                <StatusIcon className="h-3 w-3" />
                {form.status}
              </span>
            )}
            {form.assignee.trim() && (
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold text-white ${hashAvatarColor(form.assignee)}`}
              >
                {taskInitials(form.assignee)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Title" htmlFor="title" icon={ListChecks} className="sm:col-span-2" error={errors.title}>
          <TextInput
            id="title"
            required
            aria-invalid={!!errors.title}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Redesign onboarding flow"
          />
        </FormField>

        <FormField label="Description" htmlFor="description" className="sm:col-span-2">
          <TextInput
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short summary of what this task involves"
          />
        </FormField>

        <FormField label="Project" htmlFor="project" icon={FolderKanban} error={errors.project}>
          <Select id="project" required aria-invalid={!!errors.project} value={form.projectId} onChange={(e) => setProject(e.target.value)} disabled={!projects}>
            <option value="" disabled>{projects ? "Select a project…" : "Loading projects…"}</option>
            {!form.projectId && form.project && <option value="__legacy__">{form.project} (legacy, not linked)</option>}
            {projectOptions?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{!OPEN_PROJECT_STATUSES.includes(p.status) ? ` (${p.status})` : ""}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Assignee" htmlFor="assignee" icon={User} error={errors.assignee}>
          <Select id="assignee" required aria-invalid={!!errors.assignee} value={form.assignee} onChange={(e) => set("assignee", e.target.value)} disabled={!staffs}>
            <option value="" disabled>
              {staffs ? "Select an assignee…" : "Loading staff…"}
            </option>
            {form.assignee && staffs && !staffs.some((s) => s.name === form.assignee) && (
              <option value={form.assignee}>{form.assignee} (not on staff list)</option>
            )}
            {assigneeOptions?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
                {s.status !== "Active" ? ` (${s.status})` : ""}
              </option>
            ))}
          </Select>
        </FormField>

        {isEditing && (
          <FormField label="Status" icon={StatusIcon} className="sm:col-span-2">
            <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
              {TASK_STATUSES.map((s) => {
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
                        ? `border-transparent ${TASK_STATUS_CLASS[s]}`
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

        <FormField label="Priority" icon={Flag} className="sm:col-span-2">
          <div role="radiogroup" aria-label="Priority" className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => {
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
                      ? `border-transparent ${TASK_PRIORITY_CLASS[p]}`
                      : "border-input bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
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

        <FormField label="Estimate (hours)" htmlFor="estimateHours" icon={Clock} error={errors.estimateHours}>
          <TextInput
            id="estimateHours"
            type="number"
            min={0}
            max={500}
            step="0.5"
            aria-invalid={!!errors.estimateHours}
            value={form.estimateHours}
            onChange={(e) => set("estimateHours", e.target.value)}
            placeholder="8"
          />
        </FormField>

        <FormField
          label="Subtasks"
          icon={CheckSquare}
          hint={!errors.subtasksDone && totalNum > 0 ? `${pct}% complete` : undefined}
          error={errors.subtasksDone ?? errors.subtasksTotal}
        >
          <div className="flex items-center gap-2">
            <TextInput
              type="number"
              min={0}
              max={200}
              aria-label="Subtasks completed"
              aria-invalid={!!(errors.subtasksDone ?? errors.subtasksTotal)}
              value={form.subtasksDone}
              onChange={(e) => set("subtasksDone", e.target.value)}
              placeholder="0"
            />
            <span className="text-sm text-muted-foreground">/</span>
            <TextInput
              type="number"
              min={0}
              max={200}
              aria-label="Subtasks total"
              aria-invalid={!!(errors.subtasksDone ?? errors.subtasksTotal)}
              value={form.subtasksTotal}
              onChange={(e) => set("subtasksTotal", e.target.value)}
              placeholder="0"
            />
          </div>
        </FormField>

        <FormField label="Tags" htmlFor="tags" icon={Tag} className="sm:col-span-2" hint={!errors.tags ? "Separate with commas" : undefined} error={errors.tags}>
          <TextInput
            id="tags"
            aria-invalid={!!errors.tags}
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="frontend, urgent, design"
          />
        </FormField>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending} />
    </form>
  );
}