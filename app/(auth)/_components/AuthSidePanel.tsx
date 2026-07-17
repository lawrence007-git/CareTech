import { HeartPulse, ShieldCheck, Stethoscope, Activity } from "lucide-react";

export function AuthSidePanel({ variant = "signin" }: { variant?: "signin" | "signup" }) {
  const heading =
    variant === "signup" ? (
      <>
        Care that <span className="text-primary">connects.</span>
        <br />
        Tech that <span className="text-primary">heals.</span>
      </>
    ) : (
      <>
        Welcome back to <span className="text-primary">CareTech.</span>
      </>
    );

  const subheading =
    variant === "signup"
      ? "Join thousands of clinicians managing patients, appointments, and records in one secure workspace."
      : "Pick up right where you left off — patients, schedules and records are waiting.";

  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* Soft background orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      {/* Brand */}
      <div className="relative flex items-center gap-2.5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <HeartPulse className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">CareTech</span>
      </div>

      {/* Illustration cluster */}
      <div className="relative my-10 flex-1">
        <div className="relative mx-auto h-full w-full max-w-md">
          {/* Patient record card */}
          <div className="absolute left-4 top-6 w-64 rotate-[-4deg] rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dr. Reyes</p>
                <p className="text-xs text-muted-foreground">Cardiology • On call</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full bg-muted" />
              <div className="h-2 w-3/4 rounded-full bg-muted" />
            </div>
          </div>

          {/* Vitals card */}
          <div className="absolute right-2 top-24 w-60 rotate-[3deg] rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vitals
              </span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-end gap-3">
              <div>
                <p className="text-2xl font-semibold">72</p>
                <p className="text-[11px] text-muted-foreground">bpm</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">120/80</p>
                <p className="text-[11px] text-muted-foreground">mmHg</p>
              </div>
            </div>
            <svg viewBox="0 0 120 30" className="mt-3 h-8 w-full text-primary">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points="0,20 15,20 20,8 25,26 32,14 45,20 60,20 66,6 72,26 80,18 100,18 108,10 120,18"
              />
            </svg>
          </div>

          {/* Secure badge */}
          <div className="absolute bottom-8 left-10 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">HIPAA-ready encryption</span>
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="relative">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">{subheading}</p>
        <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <span>Trusted by 500+ clinics</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span>SOC 2 Type II</span>
        </div>
      </div>
    </aside>
  );
}
