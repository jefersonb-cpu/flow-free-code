import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublicSnippets } from "@/lib/snippets";
import { getLanguage } from "@/lib/prose-lang/languages";

export const Route = createFileRoute("/snippets/")({
  head: () => ({
    meta: [
      { title: "Browse snippets — Prosa" },
      { name: "description", content: "Public Prosa programs shared by the community." },
    ],
  }),
  component: SnippetsIndex,
});

function SnippetsIndex() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["snippets", "public"],
    queryFn: () => listPublicSnippets(),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-4xl tracking-tight text-foreground">Browse snippets</h1>
      <p className="mt-2 text-sm text-muted-foreground">Public programs from the community.</p>

      <div className="mt-8">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No public snippets yet. Be the first to share one from the editor.
          </p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {data?.map((s) => {
            const lang = getLanguage(s.language);
            return (
              <li key={s.id}>
                <Link
                  to="/snippets/$id"
                  params={{ id: s.id }}
                  className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-serif text-xl text-foreground">{s.title}</h2>
                    <span className="text-xs text-muted-foreground" aria-hidden>
                      {lang.flag} {lang.name}
                    </span>
                  </div>
                  <pre className="mt-3 line-clamp-4 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                    {s.source.slice(0, 220)}
                  </pre>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
