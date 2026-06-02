import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Prosa" },
      { name: "description", content: "How Prosa collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy — Prosa" },
      { property: "og:description", content: "Our commitment to user privacy and data handling practices." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8 prose-content">
      <h1 className="font-serif text-4xl tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <section className="mt-8 space-y-4 text-muted-foreground">
        <h2 className="text-xl font-medium text-foreground">What we collect</h2>
        <p>
          When you create an account we store your email and (optionally) a display name, avatar, and bio. We also store the
          snippets and run history you choose to save.
        </p>

        <h2 className="text-xl font-medium text-foreground">How we use it</h2>
        <p>
          Data is used solely to operate the service: authenticate you, render your snippets, deliver notifications, and respond
          to support requests. We do not sell your data.
        </p>

        <h2 className="text-xl font-medium text-foreground">Cookies</h2>
        <p>We use essential cookies for authentication and theme persistence. No third-party advertising trackers.</p>

        <h2 className="text-xl font-medium text-foreground">Your rights</h2>
        <p>
          You can edit your profile, delete snippets, clear run history, unsubscribe from the newsletter, and request full account
          deletion from your profile page.
        </p>

        <h2 className="text-xl font-medium text-foreground">Contact</h2>
        <p>Privacy questions: privacy@prosa.example.</p>
      </section>
    </main>
  );
}
