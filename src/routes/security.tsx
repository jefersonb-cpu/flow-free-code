import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Prosa" },
      { name: "description", content: "A plain account of what Prosa does — and doesn't — do to protect your data." },
      { property: "og:title", content: "Security — Prosa" },
      { property: "og:description", content: "What's actually implemented today, and what isn't." },
    ],
  }),
  component: SecurityPage,
});

const implemented = [
  {
    title: "Account authentication",
    body: "Email + password sign-in handled by our managed auth provider. Passwords are never stored in plaintext.",
  },
  {
    title: "Row-level security on the database",
    body: "Every user-owned table has RLS policies so one account can only read or modify rows that belong to it. Public snippets are the explicit exception.",
  },
  {
    title: "HTTPS in transit",
    body: "All traffic to the hosted app is served over TLS by the platform host.",
  },
  {
    title: "Private snippets by default",
    body: "New snippets are private until you set their visibility to public.",
  },
];

const notYet = [
  "Two-factor authentication (planned, not built)",
  "Application-level rate limiting (relies on host defaults today)",
  "A formal vulnerability disclosure program",
  "SOC 2 / ISO 27001 certifications",
];

function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Security</h1>
        <p className="mt-2 text-muted-foreground">
          Prosa is an early project. Here is exactly what is in place today — no more, no less.
        </p>
      </header>

      <section>
        <h2 className="font-serif text-2xl text-foreground">What is implemented</h2>
        <div className="mt-4 space-y-3">
          {implemented.map((it) => (
            <article key={it.title} className="rounded-lg border border-border/60 p-5">
              <h3 className="font-medium text-foreground">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-foreground">Not in place yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We'd rather list these honestly than pretend they exist.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {notYet.map((n) => (
            <li key={n} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Found something concerning? Use the contact page — we read everything.
      </p>
    </main>
  );
}
