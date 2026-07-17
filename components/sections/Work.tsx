"use client";

import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    name: "Atlas Freight OS",
    tag: "Logistics",
    summary:
      "Replaced 14 spreadsheets and a legacy AS/400 with a unified dispatch and billing platform across 9 terminals.",
    metric: "−68%",
    metricLabel: "manual entry time",
    accent: "from-primary/20 to-primary/0",
  },
  {
    name: "Nyle Banking Console",
    tag: "Fintech",
    summary:
      "Internal review console for KYC, dispute handling, and ledger adjustments — built to SOC2 from week one.",
    metric: "3.2×",
    metricLabel: "analyst throughput",
    accent: "from-primary/15 to-primary/0",
  },
  {
    name: "Carehub Triage",
    tag: "Healthtech",
    summary:
      "Patient intake, scheduling, and triage workflow connecting four EHRs and a regional referral network.",
    metric: "11min",
    metricLabel: "avg. intake (was 47)",
    accent: "from-primary/25 to-primary/0",
  },
];

export function Work() {
  return (
    <section id="work" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              02 · Selected work
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Systems in production.
            </h2>
          </div>
          <a
            href="/signin"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Request full case studies →
          </a>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <article
              key={p.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div
                className={`relative h-40 overflow-hidden bg-gradient-to-br ${p.accent}`}
              >
                <ProjectVisual seed={p.name} />
                <span className="absolute left-4 top-4 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
                  {p.tag}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.summary}
                </p>
                <div className="mt-6 flex items-baseline gap-2 border-t border-border pt-4">
                  <span className="font-display text-3xl font-bold tracking-tight text-primary">
                    {p.metric}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.metricLabel}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ seed }: { seed: string }) {
  // Tiny deterministic abstract visual per project
  const n = seed.length;
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x={10 + i * 30}
          y={10 + ((i * n) % 30)}
          width="20"
          height={60 - ((i * n) % 35)}
          rx="2"
          className="fill-primary/30"
          style={{ opacity: 0.4 + i * 0.1 }}
        />
      ))}
      <path
        d="M0 80 Q 50 40, 100 60 T 200 50"
        stroke="var(--primary)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}