"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { greetingForHour } from "@/lib/types/dashboard";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function DashboardHero() {
  const now = useClock();
  const projects = useQuery(api.projects.list) ?? [];
  const staffs = useQuery(api.staffs.list) ?? [];

  const hour = now?.getHours() ?? 9;
  const greeting = greetingForHour(hour);
  const firstName = staffs[0]?.name.split(" ")[0] ?? "there";

  const avgProgress = Math.round(
    projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1)
  );
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - avgProgress / 100);

  const dateLabel = now?.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeLabel = now?.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-deep via-primary to-primary-deep p-6 text-primary-foreground shadow-sm blue-glow sm:p-8">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -right-16 -top-16 h-56 w-56 animate-float rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {dateLabel ?? "Loading today's date"}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 max-w-md text-sm text-primary-foreground/80">
            Here&apos;s the pulse of Mesa Systems right now — projects, tasks, revenue, and your
            team, all in one place.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Local time</p>
            <p className="font-mono text-2xl font-semibold tabular-nums">{timeLabel ?? "--:--:--"}</p>
          </div>

          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold">{avgProgress}%</span>
              <span className="text-[9px] uppercase tracking-wide text-primary-foreground/70">Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}