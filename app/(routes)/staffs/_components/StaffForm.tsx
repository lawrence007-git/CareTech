"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, CalendarDays, UserCheck, UserMinus, UserX } from "lucide-react";
import { FormField, TextInput } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import { STAFF_STATUS_CLASS } from "@/lib/types/staffs";
import type { Staff, StaffStatus } from "@/lib/types/staffs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { validatePersonName, validateEmail, validateNotFutureDate, normalizeText, type Errors } from "@/lib/validation";

const STATUSES: StaffStatus[] = ["Active", "On Leave", "Inactive"];

const STATUS_ICON: Record<StaffStatus, typeof UserCheck> = {
  Active: UserCheck,
  "On Leave": UserMinus,
  Inactive: UserX,
};

function formatDate(value: string) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type FieldName = "name" | "email" | "joined";
type FormValues = {
  name: string;
  email: string;
  status: StaffStatus;
  joined: string;
};

function validate(values: FormValues): Errors<FieldName> {
  return {
    // A person's name — reject digits/symbols masquerading as a name
    // (e.g. "12345"), since this renders as avatar initials elsewhere.
    name: validatePersonName(values.name, "Name") ?? undefined,
    email: validateEmail(values.email) ?? undefined,
    // A staff member can't have joined in the future — Team Pulse and the
    // activity feed both order/read off this date.
    joined: validateNotFutureDate(values.joined, "Joined date") ?? undefined,
  };
}

export function StaffForm({
  initial,
  staffId,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<Staff>;
  staffId?: Id<"staffs">;
  submitLabel: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const createStaff = useMutation(api.staffs.create);
  const updateStaff = useMutation(api.staffs.update);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});

  const isEditing = Boolean(staffId);

  const [form, setForm] = useState<FormValues>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    status: (initial?.status ?? "Inactive") as StaffStatus,
    joined: initial?.joined ?? "",
  });

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

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
      email: form.email.trim().toLowerCase(),
      // New staff always start Active; status only becomes editable once
      // the record exists.
      status: isEditing ? form.status : ("Inactive" as StaffStatus),
      joined: form.joined,
    };
    try {
      if (staffId) {
        await updateStaff({ id: staffId, ...payload });
      } else {
        await createStaff(payload);
      }
      router.push(cancelHref);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Live staff preview */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initials(form.name)}
            </div>
            <div>
              <p className="font-semibold leading-tight text-foreground">
                {form.name.trim() || "New staff member"}
              </p>
              <p className="text-xs text-muted-foreground">{form.email.trim() || "No email yet"}</p>
            </div>
          </div>
          {isEditing && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${STAFF_STATUS_CLASS[form.status]}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {form.status}
            </span>
          )}
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border/70 pt-3 text-xs">
          <span className="text-muted-foreground">
            Joined <span className="text-foreground">{formatDate(form.joined) ?? "—"}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" icon={User} className="sm:col-span-2" error={errors.name}>
          <TextInput
            id="name"
            required
            aria-invalid={!!errors.name}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Cooper"
          />
        </FormField>

        <FormField label="Email" htmlFor="email" icon={Mail} className="sm:col-span-2" error={errors.email}>
          <TextInput
            id="email"
            type="email"
            required
            aria-invalid={!!errors.email}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.com"
          />
        </FormField>

        {isEditing && (
          <FormField label="Status" icon={StatusIcon}>
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
                        ? `border-transparent ${STAFF_STATUS_CLASS[s]}`
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

        <FormField
          label="Joined"
          htmlFor="joined"
          icon={CalendarDays}
          hint={formatDate(form.joined) ?? undefined}
          error={errors.joined}
        >
          <TextInput
            id="joined"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            aria-invalid={!!errors.joined}
            value={form.joined}
            onChange={(e) => set("joined", e.target.value)}
          />
        </FormField>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending} />
    </form>
  );
}