"use client";

const testimonials = [
  {
    quote:
      "We automated 80% of our order processing in nine weeks. What used to take two operators a full week now runs unattended overnight. The ROI was undeniable by month three.",
    name: "Sarah Chen",
    role: "Director of Operations",
    company: "Northwind Logistics",
  },
  {
    quote:
      "CareTech rebuilt our compliance back-office around the way our analysts actually work. We stopped losing time to context switching and started catching exceptions earlier.",
    name: "Daniel Okafor",
    role: "Head of Risk",
    company: "Nyle Banking",
  },
];

export function Approach() {
  return (
    <section id="approach" className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              03 · Approach
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              We work in short, measured cycles.
            </h2>
            <p className="mt-6 text-base text-muted-foreground">
              Three phases. No 18-month roadmaps. Each phase ships something
              your team can actually use on Monday.
            </p>

            <ol className="mt-10 space-y-6">
              {[
                {
                  n: "01",
                  title: "Map the system",
                  body: "Two weeks. We sit with operators, audit the data, and write a plain-English contract for what to build.",
                },
                {
                  n: "02",
                  title: "Ship the core",
                  body: "Six to ten weeks. The smallest version of the system that replaces something painful. In production.",
                },
                {
                  n: "03",
                  title: "Extend and hand off",
                  body: "Documentation, runbooks, and your team owning what we built — or we stay on as the on-call partner.",
                },
              ].map((p) => (
                <li key={p.n} className="flex gap-5">
                  <span className="font-display text-2xl font-bold tracking-tight text-primary">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6 md:col-span-7">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M7 7h4v4H8c0 2 1 3 3 3v3c-4 0-7-2-7-6V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-4 0-7-2-7-6V7z"
                  />
                </svg>
                <blockquote className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-balance">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                    {t.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </span>
                  <span className="text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}