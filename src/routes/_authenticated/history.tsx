import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listRunHistory } from "@/lib/snippets";
import { useAuth } from "@/lib/auth-context";
import { getLanguage } from "@/lib/prose-lang/languages";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Run history — Prosa" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["run_history", user?.id],
    queryFn: () => (user ? listRunHistory(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const clearAll = async () => {
    if (!user || !confirm("Clear all run history?")) return;
    const { error } = await supabase.from("run_history").delete().eq("user_id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("History cleared.");
      qc.invalidateQueries({ queryKey: ["run_history"] });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Run history</h1>
        {data && data.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll}>Clear all</Button>
        )}
      </div>

      {data && data.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No runs recorded yet.</p>
      )}

      <ul className="mt-6 space-y-3">
        {data?.map((r) => {
          const lang = getLanguage(r.language);
          return (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{lang.flag} {lang.name} · {new Date(r.created_at).toLocaleString()}</span>
                <span className={r.success ? "text-success" : "text-destructive"}>
                  {r.success ? "ok" : "error"}
                </span>
              </div>
              <pre className="mt-3 line-clamp-4 whitespace-pre-wrap font-mono text-xs text-foreground">{r.source}</pre>
              {r.output && (
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{r.output}</pre>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
