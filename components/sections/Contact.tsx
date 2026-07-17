"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                04 · Start a build
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-5xl">
                Tell us what's broken.
                <br />
                <span className="text-muted-foreground/60">
                  We'll tell you what's buildable.
                </span>
              </h2>
              <p className="mt-6 max-w-md text-sm text-muted-foreground">
                30-minute call. No deck. We listen for the actual operational
                pain and respond within two business days with a written take.
              </p>

              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "Fixed-scope discovery",
                  "Senior engineers only",
                  "Code and docs you own",
                ].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-primary" /> {i}
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="md:col-span-6"
            >
              {submitted ? (
                <div className="grid h-full place-items-center rounded-2xl border border-border bg-surface p-10 text-center">
                  <div>
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold">
                      Got it.
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We'll reply within two business days.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field
                    label="Name"
                    id="name"
                    autoComplete="name"
                    required
                  />
                  <Field
                    label="Work email"
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                  <Field
                    label="Company"
                    id="company"
                    autoComplete="organization"
                  />
                  <div>
                    <label
                      htmlFor="message"
                      className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
                    >
                      What's the system you need?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground blue-glow transition-transform hover:-translate-y-0.5"
                  >
                    Send
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  id,
  type = "text",
  ...rest
}: {
  label: string;
  id: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
        {...rest}
      />
    </div>
  );
}