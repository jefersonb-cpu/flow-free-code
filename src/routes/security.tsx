import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Prosa" },
      { name: "description", content: "How we keep your account, code, and data safe on Prosa." },
      { property: "og:title", content: "Security — Prosa" },
      { property: "og:description", content: "Our security posture: 2FA, rate limiting, encryption, and disclosure." },
    ],
  }),
  component: SecurityPage,
});

const items = [
  {
    title: "Two-factor authentication",
    body: "Enable TOTP-based 2FA from your profile. We recommend Authy, 1Password, or any RFC 6238 app.",
  },
  {
    title: "Rate limiting",
    body: "Login, signup, and snippet write endpoints are rate limited per IP and per account to deter brute-force and abuse.",
  },
  {
    title: "Encryption",
    body: "All traffic is TLS 1.3. Data at rest is AES-256 encrypted by our managed database provider.",
  },
  {
    title: "Row-level security",
    body: "Every table enforces row-level security so a user can only ever read or modify their own private data.",
  },
  {
    title: "Responsible disclosure",
    body: "Found a vulnerability? Email security@prosa.example. We acknowledge within 48 hours and credit reporters.",
  },
];

function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Security</h1>
        <p className="mt-2 text-muted-foreground">The controls and practices that keep Prosa trustworthy.</p>
      </header>
      <div className="space-y-4">
        {items.map((it) => (
          <section key={it.title} className="rounded-lg border border-border/60 p-5">
            <h2 className="font-medium text-foreground">{it.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
