"use client";

import { Boxes, GitBranch, LineChart, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Unified business logic",
    body: "Connect CRM, ERP, billing, and warehouse data behind one consistent layer — so every team works from the same source of truth.",
    span: "md:col-span-7",
  },
  {
    icon: LineChart,
    title: "Operational visibility",
    body: "Replace screenshot reports with live dashboards your operators actually open on Mondays.",
    span: "md:col-span-5",
  },
  {
    icon: Boxes,
    title: "Internal platforms",
    body: "Admin tools, back-offices, and queue managers built for the people who run the business, not the people who sell to them.",
    span: "md:col-span-5",
  },
  {
    icon: ShieldCheck,
    title: "Built to be audited",
    body: "RBAC, audit logs, SSO, and SOC2-ready scaffolding from day one — not bolted on after the first compliance review.",
    span: "md:col-span-7",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              01 · Capabilities
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
              The work behind the dashboard.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            We don't ship pretty front-ends on broken plumbing. Each engagement
            starts with the data and ends with the people using it.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-12">
          {features.map((f) => (
            <article
              key={f.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40 ${f.span}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
              </div>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}