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
    a: "No. Prosa is a deterministic grammar-based interpreter. The same input always produces the same output — there is no model and no probabilistic guessing.",
  },
  {
    q: "Which human languages are supported?",
    a: "Eight base languages: English, Spanish, French, German, Italian, Portuguese, Japanese, and Chinese. Each has a casual 'slang' register as well.",
  },
  {
    q: "Can I run Prosa offline?",
    a: "The interpreter itself is a small JavaScript module that runs entirely in your browser. The hosted editor and snippet storage require an internet connection.",
  },
  {
    q: "Is my code private?",
    a: "Snippets default to private. They only become visible to other users if you explicitly switch the visibility to public.",
  },
  {
    q: "How do I share or fork a snippet?",
    a: "Open any public snippet and use Fork to copy it into your account, or copy the page URL to share it.",
  },
  {
    q: "Do you offer an API or a paid plan?",
    a: "Not today. Pricing tiers exist in the app for demonstration only — billing is not connected, and there is no hosted API yet.",
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
