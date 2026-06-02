import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Prosa" },
      { name: "description", content: "The terms governing use of the Prosa platform." },
      { property: "og:title", content: "Terms of Service — Prosa" },
      { property: "og:description", content: "Rules of the road for using Prosa." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <section className="mt-8 space-y-4 text-muted-foreground">
        <h2 className="text-xl font-medium text-foreground">Acceptable use</h2>
        <p>
          Don't use Prosa to host malware, harass other users, or run code that violates the law. Public snippets may be moderated
          or removed if reported.
        </p>

        <h2 className="text-xl font-medium text-foreground">Your content</h2>
        <p>
          You retain ownership of snippets you create. By marking a snippet public you grant other users the right to view, fork,
          star, and comment on it.
        </p>

        <h2 className="text-xl font-medium text-foreground">Service availability</h2>
        <p>
          We aim for high uptime but provide the service "as is" without warranty. We may change features as the platform evolves.
        </p>

        <h2 className="text-xl font-medium text-foreground">Termination</h2>
        <p>You may close your account at any time. We may suspend accounts that violate these terms.</p>

        <h2 className="text-xl font-medium text-foreground">Contact</h2>
        <p>Questions about these terms: legal@prosa.example.</p>
      </section>
    </main>
  );
}
