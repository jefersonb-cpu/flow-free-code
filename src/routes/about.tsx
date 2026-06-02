import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Prosa" },
      { name: "description", content: "Why we built Prosa: programming should be readable in any human language." },
      { property: "og:title", content: "About — Prosa" },
      { property: "og:description", content: "The story behind a deterministic, multilingual programming runtime." },
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
          Programming should read like the language you think in.
        </p>
      </header>

      <section className="space-y-5 text-muted-foreground">
        <p>
          Prosa began as a side experiment: could everyday prose — written in English, Spanish, or Japanese — be parsed
          deterministically into runnable code? Three years later, the answer is yes.
        </p>
        <p>
          We're a small team of linguists and compiler engineers building tools that meet people where they are. No models, no
          guessing. Just a clear grammar and a fast interpreter.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { n: "8", l: "human languages" },
          { n: "12k+", l: "snippets shared" },
          { n: "100%", l: "deterministic" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-border/60 p-5">
            <p className="font-serif text-3xl text-foreground">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
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
