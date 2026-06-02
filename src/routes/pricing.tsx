import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Prosa" },
      { name: "description", content: "Simple plans for learners, power users, and teams. Start free." },
      { property: "og:title", content: "Pricing — Prosa" },
      { property: "og:description", content: "Free forever. Upgrade when you outgrow it." },
    ],
  }),
  component: PricingPage,
});

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_monthly_cents: number;
  price_yearly_cents: number;
  features: string[];
  is_featured: boolean;
};

function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [current, setCurrent] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order");
      setPlans((data ?? []) as Plan[]);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("plan_slug")
        .eq("user_id", user.id)
        .maybeSingle();
      setCurrent(data?.plan_slug ?? "free");
    })();
  }, [user]);

  const choose = async (plan: Plan) => {
    if (!isAuthenticated || !user) {
      toast.error("Sign in to choose a plan.");
      return;
    }
    setBusy(plan.slug);
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + (cycle === "yearly" ? 365 : 30));
    const { error } = await supabase.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        plan_slug: plan.slug,
        billing_cycle: cycle,
        status: "active",
        current_period_end: periodEnd.toISOString(),
      },
      { onConflict: "user_id" },
    );
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrent(plan.slug);
    toast.success(
      plan.slug === "free"
        ? "You're on the Free plan."
        : `Welcome to ${plan.name}! Payment integration coming soon — your plan is active in demo mode.`,
    );
  };

  const fmt = (cents: number) => (cents === 0 ? "Free" : `$${(cents / 100).toFixed(0)}`);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Simple, honest pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade only when you need more.</p>

        <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 text-sm">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={[
                "rounded-full px-4 py-1.5 capitalize transition",
                cycle === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {c}
              {c === "yearly" && <span className="ml-1.5 text-xs opacity-80">save 17%</span>}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = current === plan.slug;
          const price = cycle === "yearly" ? plan.price_yearly_cents / 12 : plan.price_monthly_cents;
          return (
            <article
              key={plan.id}
              className={[
                "relative flex flex-col rounded-2xl border bg-card/40 p-6",
                plan.is_featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60",
              ].join(" ")}
            >
              {plan.is_featured && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Most popular
                </div>
              )}
              <h2 className="font-serif text-2xl text-foreground">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl text-foreground">{fmt(price)}</span>
                {plan.price_monthly_cents > 0 && (
                  <span className="text-sm text-muted-foreground">/ month</span>
                )}
              </div>
              {plan.price_yearly_cents > 0 && cycle === "yearly" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  billed ${(plan.price_yearly_cents / 100).toFixed(0)} yearly
                </p>
              )}

              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {isAuthenticated ? (
                  <Button
                    className="w-full"
                    variant={plan.is_featured ? "default" : "outline"}
                    onClick={() => choose(plan)}
                    disabled={busy === plan.slug || isCurrent}
                  >
                    {isCurrent ? "Current plan" : busy === plan.slug ? "Switching…" : `Choose ${plan.name}`}
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={plan.is_featured ? "default" : "outline"}>
                    <Link to="/signup">Get started</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
        Payments are in demo mode. Connect Stripe from your project settings to enable real billing.
      </p>
    </main>
  );
}
