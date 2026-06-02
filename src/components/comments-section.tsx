import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Comment = {
  id: string;
  snippet_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type ProfileMap = Record<string, { display_name: string | null; avatar_url: string | null }>;

export function CommentsSection({ snippetId, snippetOwnerId }: { snippetId: string; snippetOwnerId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("snippet_comments")
      .select("*")
      .eq("snippet_id", snippetId)
      .order("created_at", { ascending: true });
    const list = (data ?? []) as Comment[];
    setComments(list);
    const ids = Array.from(new Set(list.map((c) => c.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);
      const map: ProfileMap = {};
      (profs ?? []).forEach((p: any) => {
        map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
      });
      setProfiles(map);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippetId]);

  const onPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase
      .from("snippet_comments")
      .insert({ snippet_id: snippetId, author_id: user.id, body: body.trim() });
    setPosting(false);
    if (error) toast.error(error.message);
    else {
      setBody("");
      load();
    }
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("snippet_comments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">Comments</h2>

      {isAuthenticated ? (
        <form onSubmit={onPost} className="mt-4 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            maxLength={4000}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={posting || !body.trim()}>
              {posting ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Sign in to leave a comment.</p>
      )}

      <ul className="mt-6 space-y-4">
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">No comments yet.</li>
        )}
        {comments.map((c) => {
          const prof = profiles[c.author_id];
          const canDelete = user && (user.id === c.author_id || user.id === snippetOwnerId);
          return (
            <li key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {prof?.display_name ?? "Anonymous"}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{c.body}</p>
              {canDelete && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
