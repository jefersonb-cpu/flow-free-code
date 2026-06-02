import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCode, MessageSquare, CalendarDays, Mail, CreditCard, Star, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

type Stats = Record<string, number>;

function AdminOverview() {
  const [stats, setStats] = useState<Stats>({});
  const [recent, setRecent] = useState<Array<{ id: string; action: string; created_at: string }>>([]);

  useEffect(() => {
    (async () => {
      const tables = [
        "profiles",
        "snippets",
        "snippet_comments",
        "snippet_ratings",
        "contact_messages",
        "appointments",
        "newsletter_subscribers",
        "user_subscriptions",
        "run_history",
      ] as const;
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })),
      );
      const out: Stats = {};
      tables.forEach((t, i) => (out[t] = results[i].count ?? 0));
      setStats(out);

      const { data } = await supabase
        .from("admin_audit_log")
        .select("id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setRecent(data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Users", key: "profiles", icon: Users },
    { label: "Snippets", key: "snippets", icon: FileCode },
    { label: "Comments", key: "snippet_comments", icon: MessageSquare },
    { label: "Ratings", key: "snippet_ratings", icon: Star },
    { label: "Messages", key: "contact_messages", icon: MessageSquare },
    { label: "Appointments", key: "appointments", icon: CalendarDays },
    { label: "Newsletter", key: "newsletter_subscribers", icon: Mail },
    { label: "Subscriptions", key: "user_subscriptions", icon: CreditCard },
    { label: "Code runs", key: "run_history", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">System-wide metrics at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{stats[c.key] ?? "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent admin actions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recent.map((r) => (
                <li key={r.id} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="font-mono text-xs">{r.action}</span>
                  <span className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
