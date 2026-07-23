"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Mail,
  Phone,
  Tag,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Sparkles,
  MinusCircle,
  XCircle,
} from "lucide-react";
import { FormField, TextInput } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import type { Customer, CustomerStatus } from "@/lib/types/customers";
import { validatePersonName, validateRealisticName, validateEmail, validatePhone, validateNotFutureDate, validateNumber, normalizeText, type Errors } from "@/lib/validation";

const STATUSES: CustomerStatus[] = ["Active", "Prospect", "Inactive", "Churned"];

const STATUS_META: Record<
  CustomerStatus,
  { icon: typeof CheckCircle2; classes: string }
> = {
  Active: {
    icon: CheckCircle2,
    classes:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  Prospect: {
    icon: Sparkles,
    classes:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  },
  Inactive: {
    icon: MinusCircle,
    classes:
      "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  },
  Churned: {
    icon: XCircle,
    classes:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300",
  },
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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

type FieldName = "name" | "company" | "email" | "phone" | "joined" | "lifetimeValue";
type FormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  plan: string;
  status: CustomerStatus;
  joined: string;
  lifetimeValue: string;
};

function validate(values: FormValues): Errors<FieldName> {
  return {
    // A person's name — reject digits/symbols masquerading as a name
    // (e.g. "12345"), since this renders as avatar initials elsewhere.
    name: validatePersonName(values.name, "Name") ?? undefined,
    // A company name can legitimately include digits ("3M", "7-Eleven"),
    // so only block values with no letters at all.
    company: validateRealisticName(values.company, "Company") ?? undefined,
    email: validateEmail(values.email) ?? undefined,
    phone: validatePhone(values.phone) ?? undefined,
    // A customer can't have joined in the future — the activity feed sorts
    // by this date, so a future value would pin a "new prospect" entry
    // permanently at the top.
    joined: validateNotFutureDate(values.joined, "Joined date") ?? undefined,
    // Lifetime value is optional at intake, but if present it must be a
    // real, non-negative, boundedly-sized number.
    lifetimeValue: values.lifetimeValue.trim()
      ? validateNumber(values.lifetimeValue, "Lifetime value", { max: 25_000_000 }) ?? undefined
      : undefined,
  };
}

export function CustomerForm({
  initial,
  customerId,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<Customer>;
  customerId?: Id<"customers">;
  submitLabel: string;
  cancelHref: string;
}) {

  const router = useRouter();
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});

  const isEditing = Boolean(customerId);

  const [form, setForm] = useState<FormValues>({
    name: initial?.name ?? "",
    company: initial?.company ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    plan: initial?.plan ?? "",
    status: (initial?.status ?? "Inactive") as CustomerStatus,
    joined: initial?.joined ?? "",
    lifetimeValue: initial?.lifetimeValue?.replace(/[^0-9.]/g, "") ?? "",
  });

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const ltvValue = Number.parseFloat(form.lifetimeValue);
  const formattedLtv = Number.isFinite(ltvValue) ? currency.format(ltvValue) : null;
  const StatusIcon = STATUS_META[form.status].icon;

  const onSubmit = async(e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setPending(true);
    const payload = {
    name: normalizeText(form.name),
    company: normalizeText(form.company),
    // Lowercased so "Jane@Acme.com" and "jane@acme.com" aren't silently
    // treated as two different customers in downstream counts/lookups.
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    plan: normalizeText(form.plan),
    // New customers always start as Prospect; status only becomes
    // editable once the record exists.
    status: isEditing ? form.status : ("Prospect" as CustomerStatus),
    joined: form.joined,
    lifetimeValue: formattedLtv ?? "$0",
  };
  try {
    if (customerId) {
      await updateCustomer({ id: customerId, ...payload });
    } else {
      await createCustomer(payload);
    }
    router.push(cancelHref);
  } finally {
    setPending(false);
  }
};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Live customer preview */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initials(form.name)}
            </div>
            <div>
              <p className="font-semibold leading-tight text-foreground">
                {form.name.trim() || "New customer"}
              </p>
              <p className="text-xs text-muted-foreground">
                {form.company.trim() || "No company yet"}
                {form.plan.trim() && ` · ${form.plan}`}
              </p>
            </div>
          </div>
          {isEditing && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${STATUS_META[form.status].classes}`}
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
          {form.email.trim() && (
            <span className="text-muted-foreground">
              <span className="text-foreground">{form.email}</span>
            </span>
          )}
          {formattedLtv && (
            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
              {formattedLtv} LTV
            </span>
          )}
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

        <FormField label="Company" htmlFor="company" icon={Building2} error={errors.company}>
          <TextInput
            id="company"
            required
            aria-invalid={!!errors.company}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Corp"
          />
        </FormField>
        <FormField label="Plan" htmlFor="plan" icon={Tag}>
          <TextInput
            id="plan"
            value={form.plan}
            onChange={(e) => set("plan", e.target.value)}
            placeholder="Pro"
          />
        </FormField>

        <FormField label="Email" htmlFor="email" icon={Mail} error={errors.email}>
          <TextInput
            id="email"
            type="email"
            required
            aria-invalid={!!errors.email}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@acme.com"
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone" icon={Phone} error={errors.phone}>
          <TextInput
            id="phone"
            type="tel"
            aria-invalid={!!errors.phone}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </FormField>

        {isEditing && (
          <FormField label="Status" icon={StatusIcon}>
            <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => {
                const meta = STATUS_META[s];
                const Icon = meta.icon;
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("status", s)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                      active
                        ? meta.classes
                        : "border-input bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
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

        <FormField
          label="Lifetime value (USD)"
          htmlFor="lifetimeValue"
          icon={DollarSign}
          className="sm:col-span-2"
          error={errors.lifetimeValue}
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              $
            </span>
            <TextInput
              id="lifetimeValue"
              type="number"
              min={0}
              max={25_000_000}
              step="0.01"
              aria-invalid={!!errors.lifetimeValue}
              value={form.lifetimeValue}
              onChange={(e) => set("lifetimeValue", e.target.value)}
              placeholder="4200.00"
              className="pl-6"
            />
          </div>
        </FormField>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending} />
    </form>
  );
}