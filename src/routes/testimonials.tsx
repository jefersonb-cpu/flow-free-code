import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Prosa" },
      { name: "description", content: "What developers, educators, and teams say about programming with Prosa." },
      { property: "og:title", content: "Testimonials — Prosa" },
      { property: "og:description", content: "Voices from the Prosa community." },
    ],
  }),
  component: TestimonialsPage,
});

const quotes = [
  {
    q: "Prosa lets my students focus on logic instead of syntax. They wrote real programs in their first lesson.",
    name: "Dr. Aiko Tanaka",
    role: "Computer Science teacher, Kyoto",
  },
  {
    q: "We prototype game scripts in Spanish now. Our non-engineers actually contribute to the codebase.",
    name: "Mateo Reyes",
    role: "Lead designer, Estudio Lince",
  },
  {
    q: "The deterministic grammar is what sold me. No surprises in production, ever.",
    name: "Linnea Ahlström",
    role: "Staff engineer, Northbeam",
  },
  {
    q: "I shipped my first script in French in 15 minutes. The editor is delightful.",
    name: "Camille Dubois",
    role: "Product manager, Lyon",
  },
  {
    q: "Finally, a language that doesn't pretend to read English when it really speaks Java.",
    name: "Jordan Park",
    role: "Indie developer",
  },
  {
    q: "Our docs team writes runnable examples in plain Portuguese. Game changer.",
    name: "Beatriz Carvalho",
    role: "Docs lead, Vela.io",
  },
];

function TestimonialsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <header className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Loved by writers of code</h1>
        <p className="mt-2 text-muted-foreground">A few words from the people building with Prosa.</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((t) => (
          <figure key={t.name} className="rounded-lg border border-border/60 bg-card/40 p-6">
            <blockquote className="text-sm leading-relaxed text-foreground">"{t.q}"</blockquote>
            <figcaption className="mt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{t.name}</span>
              <span> · {t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
