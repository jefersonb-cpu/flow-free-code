import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Activity, CheckCircle2, Star, FileCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Prosa" },
      { name: "description", content: "Your Prosa activity at a glance." },
    ],
  }),
  component: DashboardPage,
});

type Run = { language: string; success: boolean; created_at: string };
type Snippet = { id: string; visibility: string; language: string; created_at: string };

const COLORS = ["hsl(var(--primary))", "#94a3b8", "#a78bfa", "#f59e0b", "#22d3ee", "#f472b6", "#34d399", "#fb7185"];

function DashboardPage() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [activity, setActivity] = useState<Array<{ at: string; kind: string; text: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [r, s, f] = await Promise.all([
        supabase.from("run_history").select("language, success, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("snippets").select("id, visibility, language, created_at").eq("owner_id", user.id),
        supabase.from("snippet_favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      setRuns((r.data ?? []) as Run[]);
      setSnippets((s.data ?? []) as Snippet[]);
      setFavCount(f.count ?? 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Realtime live activity feed via WebSocket subscription.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`dashboard-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "run_history", filter: `user_id=eq.${user.id}` },
        (p) => {
          const row = p.new as any;
          setActivity((prev) =>
            [{ at: row.created_at, kind: row.success ? "ok" : "fail", text: `Ran ${row.language} program` }, ...prev].slice(0, 8),
          );
          setRuns((prev) => [{ language: row.language, success: row.success, created_at: row.created_at }, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "snippets", filter: `owner_id=eq.${user.id}` },
        (p) => {
          const row = p.new as any;
          setActivity((prev) =>
            [{ at: row.created_at, kind: "save", text: `Saved "${row.title ?? "snippet"}"` }, ...prev].slice(0, 8),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Aggregations
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const count = runs.filter((r) => r.created_at.startsWith(key)).length;
    return { day: key.slice(5), runs: count };
  });

  const langCounts = runs.reduce<Record<string, number>>((acc, r) => {
    acc[r.language] = (acc[r.language] ?? 0) + 1;
    return acc;
  }, {});
  const langData = Object.entries(langCounts).map(([name, value]) => ({ name, value }));

  const successRate = runs.length
    ? Math.round((runs.filter((r) => r.success).length / runs.length) * 100)
    : 0;

  const visibilitySplit = [
    { name: "Public", value: snippets.filter((s) => s.visibility === "public").length },
    { name: "Private", value: snippets.filter((s) => s.visibility !== "public").length },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Your dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live activity, recent runs, and saved programs.</p>
        </div>
        <Link to="/" className="text-sm text-primary hover:underline">Open editor →</Link>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Activity className="h-4 w-4" />} label="Total runs" value={runs.length} />
            <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Success rate" value={`${successRate}%`} />
            <Stat icon={<FileCode className="h-4 w-4" />} label="Snippets" value={snippets.length} />
            <Stat icon={<Star className="h-4 w-4" />} label="Starred" value={favCount} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card title="Runs (last 14 days)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="runs" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Languages used">
              {langData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={langData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                      {langData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty>No runs yet.</Empty>
              )}
            </Card>

            <Card title="Snippet visibility">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={visibilitySplit}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Live activity" className="lg:col-span-2">
              <div className="flex items-center gap-2 pb-3 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Connected via WebSocket
              </div>
              {activity.length === 0 ? (
                <Empty>Run a program — events show up here in realtime.</Empty>
              ) : (
                <ul className="space-y-2">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span
                        className={[
                          "inline-block h-1.5 w-1.5 rounded-full",
                          a.kind === "fail" ? "bg-destructive" : a.kind === "save" ? "bg-primary" : "bg-success",
                        ].join(" ")}
                      />
                      <span className="text-foreground">{a.text}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-serif text-3xl text-foreground">{value}</p>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border/60 bg-card/40 p-5 ${className ?? ""}`}>
      <h2 className="mb-3 text-sm font-medium text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>;
}
