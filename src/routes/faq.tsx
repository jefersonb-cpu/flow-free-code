import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Prosa" },
      { name: "description", content: "Frequently asked questions about Prosa, the natural-language programming runtime." },
      { property: "og:title", content: "FAQ — Prosa" },
      { property: "og:description", content: "Answers about how Prosa works, supported languages, pricing, and privacy." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "Is Prosa AI?",
    a: "No. Prosa is a deterministic grammar-based runtime. Programs parse and execute the same way every time — no model, no hallucinations.",
  },
  {
    q: "Which human languages are supported?",
    a: "English, Spanish, French, German, Portuguese, Italian, Dutch, and Japanese — with more on the way.",
  },
  {
    q: "Can I run Prosa offline?",
    a: "Yes. The interpreter is a small JavaScript bundle that runs entirely in your browser.",
  },
  {
    q: "Is my code private?",
    a: "Snippets default to private. You only share them by explicitly setting visibility to public.",
  },
  {
    q: "How do I share or fork a snippet?",
    a: "Open any public snippet and use the Fork button to copy it into your account, or Share to copy a link.",
  },
  {
    q: "Do you offer an API?",
    a: "A hosted API is on the roadmap. For now, embed the open-source interpreter directly in your project.",
  },
];

function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Frequently asked questions</h1>
        <p className="mt-2 text-muted-foreground">Everything you might want to know before getting started.</p>
      </header>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
