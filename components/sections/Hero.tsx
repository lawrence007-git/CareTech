"use client";

import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Now taking Q3 engagements
            </div>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-balance sm:text-6xl md:text-7xl">
              We build the<br />
              <span className="text-muted-foreground/60">systems behind</span>
              <br />
              <span className="relative inline-block">
                serious businesses.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-primary"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 Q 80 1 150 6 T 298 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
              CareTech designs and engineers internal platforms, integrations,
              and operational tools that replace spreadsheets, glue code, and
              guesswork — for teams that have outgrown them.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground blue-glow transition-transform hover:-translate-y-0.5"
              >
                See the systems we ship
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-surface"
              >
                Book a 30-min call
              </a>
            </div>

            <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
              Trusted by operations teams at logistics, fintech, and healthtech
              companies.
            </p>
          </div>

          <div className="md:col-span-4">
            <SystemDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemDiagram() {
  return (
    <div className="relative aspect-square w-full max-w-sm rounded-2xl border border-border bg-surface p-6 blue-glow animate-float">
      <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        live
      </div>

      <svg viewBox="0 0 240 240" className="h-full w-full">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Edges */}
        <g stroke="url(#edge)" strokeWidth="1.5" fill="none">
          <path d="M50 60 L120 120" className="animate-draw" />
          <path d="M190 50 L120 120" className="animate-draw" />
          <path d="M50 180 L120 120" className="animate-draw" />
          <path d="M190 190 L120 120" className="animate-draw" />
          <path d="M120 120 L120 30" className="animate-draw" />
        </g>

        {/* Nodes */}
        {[
          { cx: 50, cy: 60, label: "CRM" },
          { cx: 190, cy: 50, label: "ERP" },
          { cx: 50, cy: 180, label: "Ops" },
          { cx: 190, cy: 190, label: "DW" },
          { cx: 120, cy: 30, label: "API" },
        ].map((n) => (
          <g key={n.label}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r="14"
              className="fill-background stroke-border"
            />
            <text
              x={n.cx}
              y={n.cy + 3}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ font: "600 8px var(--font-mono)" }}
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* Center hub */}
        <circle cx="120" cy="120" r="22" className="fill-primary" />
        <text
          x="120"
          y="124"
          textAnchor="middle"
          className="fill-primary-foreground"
          style={{ font: "700 9px var(--font-mono)" }}
        >
          CARETECH
        </text>
      </svg>

      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>nodes · 5</span>
        <span>latency · 42ms</span>
      </div>
    </div>
  );
}