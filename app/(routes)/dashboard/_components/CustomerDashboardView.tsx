"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { StatsCard } from "../../_components/StatsCard";
import { PROJECT_STATUS_CLASS, PROJECT_STATUS_ACCENT_SOLID, daysUntil } from "@/lib/types/projects";
import { INVOICE_STATUS_CLASS } from "@/lib/types/billing";
import { parseAmount, greetingForHour } from "@/lib/types/dashboard";
import { FolderKanban, CheckCircle2, Receipt, Sparkles, ArrowUpRight, LifeBuoy, Mail } from "lucide-react";

export function CustomerDashboard() {
  const { user } = useCurrentUser();
  const customer = useQuery(api.customers.me);
  const projectsQuery = useQuery(api.projects.listMine);
  const invoicesQuery = useQuery(api.billing.listMine);

  const isLoading = customer === undefined || projectsQuery === undefined || invoicesQuery === undefined;
  const projects = projectsQuery ?? [];
  const invoices = invoicesQuery ?? [];

  const activeProjects = projects.filter((p) => p.status !== "Completed" && p.status !== "Cancelled");
  const tasksTotal = projects.reduce((s, p) => s + p.tasksTotal, 0);
  const tasksDone = projects.reduce((s, p) => s + p.tasksDone, 0);
  const overallCompletion = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const outstanding = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue");
  const outstandingTotal = outstanding.reduce((s, i) => s + parseAmount(i.amount), 0);

  const spotlight = [...activeProjects]
    .sort((a, b) => daysUntil(a.due) - daysUntil(b.due))
    .slice(0, 4);
  const recentInvoices = [...invoices].slice(0, 4);

  const firstName = user?.firstName ?? user?.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your portal…</p>;
  }

  if (!customer) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">Your account isn&apos;t linked yet</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          We couldn&apos;t find a customer profile matching your sign-in email. Reach out to your
          account manager and we&apos;ll get your projects and billing connected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {greeting}, {firstName}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{customer.company}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary-deep dark:text-foreground">
                {customer.plan} plan
              </span>
              <span className="rounded-full bg-status-done/15 px-2.5 py-1 font-medium text-status-done">
                {customer.status} account
              </span>
            </div>
          </div>
          <Sparkles className="h-10 w-10 shrink-0 text-primary/30" />
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          label="Active Projects"
          value={String(activeProjects.length)}
          hint={`of ${projects.length} total`}
          icon={FolderKanban}
          iconClassName="bg-status-planning/10 text-status-planning"
        />
        <StatsCard
          label="Work Completed"
          value={`${overallCompletion}%`}
          hint={`${tasksDone} of ${tasksTotal} tasks done`}
          icon={CheckCircle2}
          iconClassName="bg-status-done/10 text-status-done"
        />
        <StatsCard
          label="Amount Outstanding"
          value={`$${outstandingTotal.toLocaleString()}`}
          hint={`${outstanding.length} invoice${outstanding.length === 1 ? "" : "s"} due`}
          icon={Receipt}
          iconClassName="bg-status-onhold/10 text-status-onhold"
        />
        <StatsCard
          label="Account Status"
          value={customer.status}
          hint={`Member since ${customer.joined}`}
          icon={Sparkles}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project monitoring summary */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Project monitoring</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Live progress on the work we&apos;re doing for you.</p>
            </div>
            <Link
              href="/portal/projects"
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="mt-4 space-y-3">
            {spotlight.map((p) => {
              const daysLeft = daysUntil(p.due);
              return (
                <li key={p.id} className="rounded-lg border border-border/70 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PROJECT_STATUS_CLASS[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${PROJECT_STATUS_ACCENT_SOLID[p.status]}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">{p.progress}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {p.tasksDone}/{p.tasksTotal} tasks complete
                    </span>
                    <span className={daysLeft < 0 ? "font-medium text-destructive" : ""}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>
                </li>
              );
            })}
            {spotlight.length === 0 && (
              <p className="text-xs text-muted-foreground">No active projects right now.</p>
            )}
          </ul>
        </section>

        <div className="space-y-6">
          {/* Billing summary */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent invoices</h3>
              <Link
                href="/portal/billing"
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {recentInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">{inv.issued}</span>
                  <span className="font-medium">{inv.amount}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${INVOICE_STATUS_CLASS[inv.status]}`}>
                    {inv.status}
                  </span>
                </li>
              ))}
              {recentInvoices.length === 0 && (
                <p className="text-xs text-muted-foreground">No invoices on file yet.</p>
              )}
            </ul>
          </section>

          {/* Support */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Need help?</h3>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Your account manager can answer questions about scope, timelines, or billing.
            </p>
            <a
              href="mailto:support@caretech.example"
              className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs font-medium hover:bg-accent/40"
            >
              <Mail className="h-3.5 w-3.5" /> support@caretech.example
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}