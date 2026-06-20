import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Prosa" },
      { name: "description", content: "Prosa is a new project — testimonials will appear here once early users share theirs." },
      { property: "og:title", content: "Testimonials — Prosa" },
      { property: "og:description", content: "Coming soon: voices from early Prosa users." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Testimonials</h1>
        <p className="mt-2 text-muted-foreground">Honest words from real people — once there are some.</p>
      </header>

      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-2xl text-foreground">No testimonials yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Prosa is brand new and we'd rather show nothing than make up quotes. If you've tried it
          and have feedback — good, bad, or weird — we'd love to hear from you.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
        >
          Share your feedback
        </Link>
      </div>
    </main>
  );
}
