"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DollarSign,
  CalendarDays,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FormField, TextInput } from "../../_components/FormField";
import { FormActions } from "../../_components/FormShell";
import { INVOICE_STATUS_CLASS, type Invoice, type InvoiceStatus } from "@/lib/types/billing";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { validateRealisticName, validateNumber, validateRealisticDate, validateDateOrder, normalizeText, type Errors } from "@/lib/validation";

const STATUSES: InvoiceStatus[] = ["Draft", "Pending", "Paid", "Overdue"];

const STATUS_ICON: Record<InvoiceStatus, typeof Circle> = {
  Draft: Circle,
  Pending: Clock,
  Paid: CheckCircle2,
  Overdue: AlertCircle,
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type FieldName = "customer" | "amount" | "issued" | "due";
type FormValues = {
  customer: string;
  amount: string;
  status: InvoiceStatus;
  issued: string;
  due: string;
};

function validate(values: FormValues): Errors<FieldName> {
  return {
    // Catches junk like "a", "x", or "12345" that would show up as-is in
    // the Reports/Dashboard activity feed and revenue breakdowns. Uses the
    // looser org-style check since an invoice "customer" here may be a
    // company name ("Acme Corp") rather than strictly a person.
    customer: validateRealisticName(values.customer, "Customer") ?? undefined,
    // Capped well below the default ceiling — a single invoice north of $1M
    // is almost always a typo, and an uncapped value would blow out the
    // revenue chart's Y-axis scale for every other month.
    amount: validateNumber(values.amount, "Amount", { allowZero: false, max: 1_000_000 }) ?? undefined,
    // Invoices can be scheduled a little ahead, but not years out — bounded
    // so a mis-picked year doesn't create a phantom revenue bucket far in
    // the future on the trend chart.
    issued: validateRealisticDate(values.issued, "Issued date", { maxYearsAhead: 1 }) ?? undefined,
    due:
      validateRealisticDate(values.due, "Due date", { maxYearsAhead: 2 }) ??
      validateDateOrder(values.issued, values.due, "the issued date", "Due date") ??
      undefined,
  };
}

function formatDate(value: string) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function dueMeta(due: string, status: InvoiceStatus) {
  if (!due) return null;
  const target = new Date(`${due}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (status === "Paid") return { text: "Paid in full", tone: "text-status-done" };
  if (days < 0)
    return { text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`, tone: "text-status-blocked" };
  if (days === 0) return { text: "Due today", tone: "text-status-progress" };
  return { text: `Due in ${days} day${days === 1 ? "" : "s"}`, tone: "text-muted-foreground" };
}

export function BillingForm({
  initial,
  invoiceId,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<Invoice>;
  invoiceId?: Id<"billing">;
  submitLabel: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const createInvoice = useMutation(api.billing.create);
  const updateInvoice = useMutation(api.billing.update);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});

  const isEditing = Boolean(invoiceId);

  const [form, setForm] = useState<FormValues>({
    customer: initial?.customer ?? "",
    amount: initial?.amount?.replace(/[^0-9.]/g, "") ?? "",
    status: (initial?.status ?? "Draft") as InvoiceStatus,
    issued: initial?.issued ?? "",
    due: initial?.due ?? "",
  });

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const amountValue = Number.parseFloat(form.amount);
  const formattedAmount = Number.isFinite(amountValue) ? currency.format(amountValue) : "$0.00";
  const due = useMemo(() => dueMeta(form.due, form.status), [form.due, form.status]);
  const StatusIcon = STATUS_ICON[form.status];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setPending(true);
    const payload = {
      customer: normalizeText(form.customer),
      amount: formattedAmount,
      // New invoices always start as Draft; status only becomes editable
      // once the record exists.
      status: isEditing ? form.status : ("Draft" as InvoiceStatus),
      issued: form.issued,
      due: form.due,
    };
    try {
      if (invoiceId) {
        await updateInvoice({ id: invoiceId, ...payload });
      } else {
        await createInvoice(payload);
      }
      router.push(cancelHref);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Live invoice preview */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {form.customer.trim() ? form.customer : "New invoice"}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
              {formattedAmount}
            </p>
          </div>
          {isEditing && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${INVOICE_STATUS_CLASS[form.status]}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {form.status}
            </span>
          )}
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border/70 pt-3 text-xs">
          <span className="text-muted-foreground">
            Issued <span className="text-foreground">{formatDate(form.issued) ?? "—"}</span>
          </span>
          <span className="text-muted-foreground">
            Due <span className="text-foreground">{formatDate(form.due) ?? "—"}</span>
          </span>
          {due && <span className={`ml-auto font-medium ${due.tone}`}>{due.text}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Customer" htmlFor="customer" icon={Building2} className="sm:col-span-2" error={errors.customer}>
          <TextInput
            id="customer"
            required
            aria-invalid={!!errors.customer}
            value={form.customer}
            onChange={(e) => set("customer", e.target.value)}
            placeholder="Acme Corp"
          />
        </FormField>

        <FormField label="Amount (USD)" htmlFor="amount" icon={DollarSign} error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              $
            </span>
            <TextInput
              id="amount"
              type="number"
              min={0.01}
              max={1_000_000}
              step="0.01"
              required
              aria-invalid={!!errors.amount}
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="1200.00"
              className="pl-6"
            />
          </div>
        </FormField>

        {isEditing && (
          <FormField label="Status" icon={StatusIcon}>
            <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-2">
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
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                      active
                        ? `border-transparent ${INVOICE_STATUS_CLASS[s]}`
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

        <FormField label="Issued" htmlFor="issued" icon={CalendarDays} hint={formatDate(form.issued) ?? undefined} error={errors.issued}>
          <TextInput
            id="issued"
            type="date"
            required
            aria-invalid={!!errors.issued}
            value={form.issued}
            onChange={(e) => set("issued", e.target.value)}
          />
        </FormField>
        <FormField label="Due" htmlFor="due" icon={CalendarDays} hint={due?.text} error={errors.due}>
          <TextInput
            id="due"
            type="date"
            required
            aria-invalid={!!errors.due}
            value={form.due}
            min={form.issued || undefined}
            onChange={(e) => set("due", e.target.value)}
          />
        </FormField>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} pending={pending} />
    </form>
  );
}