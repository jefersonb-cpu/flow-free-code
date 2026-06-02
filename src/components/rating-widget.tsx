import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function RatingWidget({ snippetId }: { snippetId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("snippet_ratings")
      .select("rating, user_id")
      .eq("snippet_id", snippetId);
    const rows = data ?? [];
    setCount(rows.length);
    setAvg(rows.length ? rows.reduce((a, r: any) => a + r.rating, 0) / rows.length : null);
    if (user) {
      const r = rows.find((row: any) => row.user_id === user.id) as { rating: number } | undefined;
      setMine(r?.rating ?? null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippetId, user?.id]);

  const rate = async (value: number) => {
    if (!user) return;
    const { error } = await supabase
      .from("snippet_ratings")
      .upsert(
        { snippet_id: snippetId, user_id: user.id, rating: value },
        { onConflict: "snippet_id,user_id" },
      );
    if (error) toast.error(error.message);
    else load();
  };

  const display = hover ?? mine ?? Math.round(avg ?? 0);

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        role="radiogroup"
        aria-label="Rate this snippet"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-label={`${v} star${v > 1 ? "s" : ""}`}
            disabled={!isAuthenticated}
            onMouseEnter={() => isAuthenticated && setHover(v)}
            onClick={() => rate(v)}
            className="disabled:cursor-not-allowed"
          >
            <Star
              className={`h-4 w-4 transition ${
                v <= display ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {avg ? `${avg.toFixed(1)} (${count})` : count > 0 ? `(${count})` : "no ratings"}
      </span>
    </div>
  );
}
