import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Prosa" },
      { name: "description", content: "Get in touch with the Prosa team for support, partnerships, or press." },
      { property: "og:title", content: "Contact — Prosa" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // Demo: client-side only. Wire to a server function or email service when ready.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Thanks — we'll be in touch within two business days.");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Contact us</h1>
        <p className="mt-2 text-muted-foreground">Questions, partnerships, or press inquiries — we read every message.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" rows={6} required />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </main>
  );
}
