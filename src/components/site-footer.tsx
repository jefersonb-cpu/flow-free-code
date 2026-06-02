import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const footerNav = [
  { label: "About", to: "/about" as const },
  { label: "Case studies", to: "/case-studies" as const },
  { label: "Testimonials", to: "/testimonials" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Contact", to: "/contact" as const },
  { label: "Security", to: "/security" as const },
  { label: "Privacy", to: "/privacy" as const },
  { label: "Terms", to: "/terms" as const },
];

export function SiteFooter() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, user_id: user?.id ?? null });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed.");
      else toast.error(error.message);
    } else {
      toast.success("Subscribed. Thanks!");
      setEmail("");
    }
  };

  return (
    <footer className="mt-16 border-t border-border/60 bg-background/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
        <form onSubmit={onSubscribe} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Newsletter</p>
            <p className="text-xs text-muted-foreground">Occasional updates on Prosa — no spam.</p>
          </div>
          <div className="flex w-full max-w-sm gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "…" : "Subscribe"}
            </Button>
          </div>
        </form>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Prosa — natural-language programming.</p>
          <p>Eight human languages · one runtime · <span className="text-foreground">no AI, just grammar.</span></p>
        </div>
      </div>
    </footer>
  );
}
