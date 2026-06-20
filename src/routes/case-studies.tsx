import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Prosa" },
      { name: "description", content: "Case studies will appear here once teams have shipped real projects with Prosa." },
      { property: "og:title", content: "Case Studies — Prosa" },
      { property: "og:description", content: "Coming soon: real-world stories from teams using Prosa." },
    ],
  }),
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Case studies</h1>
        <p className="mt-2 text-muted-foreground">Real stories, once there are real stories to tell.</p>
      </header>

      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <FolderOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-2xl text-foreground">Nothing to show yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We won't invent case studies. When real teachers, teams, or studios use Prosa for
          something interesting, we'll write it up here — with their permission and their numbers.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/50"
        >
          Try the editor instead
        </Link>
      </div>
    </main>
  );
}
