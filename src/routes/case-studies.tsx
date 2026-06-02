import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Prosa" },
      { name: "description", content: "How teams use Prosa to ship multilingual, deterministic programs." },
      { property: "og:title", content: "Case Studies — Prosa" },
      { property: "og:description", content: "Real-world stories from the Prosa community." },
    ],
  }),
  component: CaseStudiesPage,
});

const studies = [
  {
    title: "Kyoto Polytechnic: teaching 200 first-years in Japanese",
    summary:
      "A 12-week intro CS course replaced Python with Prosa. Time-to-first-program dropped from 3 hours to 12 minutes; dropout fell 38%.",
    tag: "Education",
    metric: "+38% retention",
  },
  {
    title: "Estudio Lince: designer-authored game logic",
    summary:
      "A Mexico City game studio let designers script enemy AI in Spanish. Engineering review cycles shortened from 4 days to 6 hours.",
    tag: "Gaming",
    metric: "16× faster reviews",
  },
  {
    title: "Vela.io: runnable docs in seven languages",
    summary:
      "Vela rewrote their developer docs with embedded Prosa snippets. Localized examples raised time-on-page 2.4× across markets.",
    tag: "Developer tools",
    metric: "2.4× engagement",
  },
];

function CaseStudiesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <header className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Case studies</h1>
        <p className="mt-2 text-muted-foreground">How real teams put Prosa into production.</p>
      </header>
      <div className="space-y-4">
        {studies.map((s) => (
          <article key={s.title} className="rounded-lg border border-border/60 bg-card/40 p-6 transition hover:border-border">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{s.tag}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-primary">{s.metric}</span>
            </div>
            <h2 className="mt-3 font-serif text-xl text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
