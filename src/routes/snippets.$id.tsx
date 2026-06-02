import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, GitFork, Trash2, Globe, Lock, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getSnippet,
  updateSnippet,
  deleteSnippet,
  createSnippet,
  favoriteSnippet,
  unfavoriteSnippet,
  listFavoriteIds,
} from "@/lib/snippets";
import { getLanguage } from "@/lib/prose-lang/languages";
import { run } from "@/lib/prose-lang/interpreter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommentsSection } from "@/components/comments-section";
import { RatingWidget } from "@/components/rating-widget";
import { ShareButtons } from "@/components/share-buttons";

export const Route = createFileRoute("/snippets/$id")({
  head: () => ({
    meta: [{ title: "Snippet — Prosa" }],
  }),
  component: SnippetDetail,
});

function SnippetDetail() {
  const { id } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: snippet, isLoading, error } = useQuery({
    queryKey: ["snippets", id],
    queryFn: () => getSnippet(id),
  });

  const { data: favoriteIds } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? listFavoriteIds(user.id) : Promise.resolve(new Set<string>())),
    enabled: !!user,
  });

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setSource(snippet.source);
    }
  }, [snippet]);

  const isOwner = !!user && !!snippet && snippet.owner_id === user.id;
  const isStarred = !!snippet && (favoriteIds?.has(snippet.id) ?? false);
  const lang = snippet ? getLanguage(snippet.language) : null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) return;
      await updateSnippet(snippet.id, { title, source });
    },
    onSuccess: () => {
      toast.success("Saved.");
      qc.invalidateQueries({ queryKey: ["snippets", id] });
      qc.invalidateQueries({ queryKey: ["snippets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visibilityMutation = useMutation({
    mutationFn: async (visibility: "public" | "private") => {
      if (!snippet) return;
      await updateSnippet(snippet.id, { visibility });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snippets", id] });
      qc.invalidateQueries({ queryKey: ["snippets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) return;
      await deleteSnippet(snippet.id);
    },
    onSuccess: () => {
      toast.success("Deleted.");
      navigate({ to: "/my-snippets" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const forkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !snippet) throw new Error("Sign in to fork.");
      return createSnippet({
        owner_id: user.id,
        title: `${snippet.title} (fork)`,
        language: snippet.language,
        source: snippet.source,
        visibility: "private",
        forked_from: snippet.id,
      });
    },
    onSuccess: (newSnippet) => {
      toast.success("Forked to your snippets.");
      qc.invalidateQueries({ queryKey: ["snippets"] });
      if (newSnippet) navigate({ to: "/snippets/$id", params: { id: newSnippet.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const starMutation = useMutation({
    mutationFn: async () => {
      if (!user || !snippet) throw new Error("Sign in to star.");
      if (isStarred) await unfavoriteSnippet(user.id, snippet.id);
      else await favoriteSnippet(user.id, snippet.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", user?.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onRun = () => {
    if (!lang) return;
    const r = run(source, lang);
    setOutput(r.output);
    setErrMsg(r.error?.message ?? null);
  };

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-destructive">{(error as Error).message}</div>;
  if (!snippet || !lang) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Snippet not found.</p>
        <Link to="/snippets" className="mt-3 inline-block text-sm underline">Back to browse</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {isOwner ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-auto border-0 bg-transparent p-0 font-serif !text-3xl tracking-tight shadow-none focus-visible:ring-0"
            />
          ) : (
            <h1 className="font-serif text-3xl tracking-tight text-foreground">{snippet.title}</h1>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {lang.flag} {lang.name} · {snippet.visibility}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => starMutation.mutate()}
              aria-pressed={isStarred}
            >
              <Star className={`mr-1.5 h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
              {isStarred ? "Starred" : "Star"}
            </Button>
          )}
          {isAuthenticated && (
            <Button variant="outline" size="sm" onClick={() => forkMutation.mutate()}>
              <GitFork className="mr-1.5 h-4 w-4" /> Fork
            </Button>
          )}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => visibilityMutation.mutate(snippet.visibility === "public" ? "private" : "public")}
            >
              {snippet.visibility === "public" ? (
                <><Lock className="mr-1.5 h-4 w-4" /> Make private</>
              ) : (
                <><Globe className="mr-1.5 h-4 w-4" /> Make public</>
              )}
            </Button>
          )}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Delete this snippet?")) deleteMutation.mutate();
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          readOnly={!isOwner}
          spellCheck={false}
          className="min-h-[280px] w-full resize-y bg-transparent p-5 font-mono text-sm text-foreground outline-none"
        />
        <div className="flex items-center justify-end gap-2 border-t border-border bg-card/40 px-4 py-2">
          <Button size="sm" variant="ghost" onClick={onRun}>
            <Play className="mr-1.5 h-4 w-4" /> Run
          </Button>
          {isOwner && (
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card/60 p-5 font-mono text-sm" role="status" aria-live="polite">
        {output.length === 0 && !errMsg && (
          <span className="text-muted-foreground">Output appears here.</span>
        )}
        {output.map((l, i) => (
          <div key={i}><span className="mr-2 text-muted-foreground">›</span>{l}</div>
        ))}
        {errMsg && <div className="mt-2 text-destructive">⚠ {errMsg}</div>}
      </div>
    </div>
  );
}
