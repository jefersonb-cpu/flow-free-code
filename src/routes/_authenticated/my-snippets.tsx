import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listMySnippets, listFavoriteIds } from "@/lib/snippets";
import { getLanguage } from "@/lib/prose-lang/languages";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { SortableSnippetList } from "@/components/sortable-snippet-list";

export const Route = createFileRoute("/_authenticated/my-snippets")({
  head: () => ({
    meta: [{ title: "My snippets — Prosa" }],
  }),
  component: MySnippets,
});

function MySnippets() {
  const { user } = useAuth();

  const { data: mine } = useQuery({
    queryKey: ["snippets", "mine", user?.id],
    queryFn: () => (user ? listMySnippets(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: favoriteIds } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? listFavoriteIds(user.id) : Promise.resolve(new Set<string>())),
    enabled: !!user,
  });

  const { data: starred } = useQuery({
    queryKey: ["snippets", "starred", user?.id, Array.from(favoriteIds ?? [])],
    queryFn: async () => {
      const ids = Array.from(favoriteIds ?? []);
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("snippets").select("*").in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!favoriteIds,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-4xl tracking-tight text-foreground">My snippets</h1>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-2xl text-foreground">Yours</h2>
          <p className="text-xs text-muted-foreground">Drag to reorder — saved on this device.</p>
        </div>
        {mine && mine.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't saved any snippets yet. Write a program on the{" "}
            <Link to="/" className="underline">home page</Link> and hit Save.
          </p>
        )}
        {mine && mine.length > 0 && (
          <div className="mt-3">
            <SortableSnippetList
              snippets={mine.map((s) => ({
                id: s.id,
                title: s.title,
                language: s.language,
                visibility: s.visibility,
              }))}
            />
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-foreground">Starred</h2>
        {starred && starred.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No starred snippets yet.</p>
        )}
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {starred?.map((s) => {
            const lang = getLanguage(s.language);
            return (
              <li key={s.id}>
                <Link
                  to="/snippets/$id"
                  params={{ id: s.id }}
                  className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary/60"
                >
                  <h3 className="font-serif text-lg text-foreground">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{lang.flag} {lang.name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
