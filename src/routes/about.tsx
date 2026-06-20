import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Prosa" },
      { name: "description", content: "What Prosa is, what it isn't, and why it exists." },
      { property: "og:title", content: "About — Prosa" },
      { property: "og:description", content: "A small, honest natural-language programming experiment." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">About Prosa</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A small experiment in writing programs as ordinary sentences.
        </p>
      </header>

      <section className="space-y-5 text-muted-foreground">
        <p>
          Prosa is a hobby project. It started as a question: can a fixed grammar parse plain
          sentences — in English, Spanish, Japanese, and a handful of other languages — into
          deterministic, runnable code? No AI, no probabilistic guessing. Just pattern matching
          and a tiny tree-walking interpreter.
        </p>
        <p>
          What runs today: an in-browser editor, eight base languages with a casual "slang"
          register for each, a small library of built-in math and string helpers, and accounts so
          you can save and share snippets. That's it.
        </p>
        <p>
          What is <em>not</em> true: there is no team of linguists, no enterprise customers, no
          published case studies. If you see a marketing-sounding claim anywhere on the site
          that we haven't backed up, please tell us — we'll fix it.
        </p>
      </section>

      <div className="mt-12 flex gap-3">
        <Button asChild>
          <Link to="/">Try the editor</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/contact">Get in touch</Link>
        </Button>
      </div>
    </main>
  );
}
