import { supabase } from "@/integrations/supabase/client";

export type Snippet = {
  id: string;
  owner_id: string;
  title: string;
  language: string;
  source: string;
  visibility: "public" | "private";
  forked_from: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPublicSnippets(limit = 50) {
  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Snippet[];
}

export async function listMySnippets(userId: string) {
  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Snippet[];
}

export async function getSnippet(id: string) {
  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Snippet | null;
}

export async function createSnippet(input: {
  owner_id: string;
  title: string;
  language: string;
  source: string;
  visibility?: "public" | "private";
  forked_from?: string | null;
}) {
  const { data, error } = await supabase
    .from("snippets")
    .insert({
      owner_id: input.owner_id,
      title: input.title,
      language: input.language,
      source: input.source,
      visibility: input.visibility ?? "private",
      forked_from: input.forked_from ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Snippet;
}

export async function updateSnippet(id: string, patch: Partial<Pick<Snippet, "title" | "source" | "language" | "visibility">>) {
  const { error } = await supabase.from("snippets").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSnippet(id: string) {
  const { error } = await supabase.from("snippets").delete().eq("id", id);
  if (error) throw error;
}

export async function listFavoriteIds(userId: string) {
  const { data, error } = await supabase
    .from("snippet_favorites")
    .select("snippet_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.snippet_id as string));
}

export async function favoriteSnippet(userId: string, snippetId: string) {
  const { error } = await supabase
    .from("snippet_favorites")
    .insert({ user_id: userId, snippet_id: snippetId });
  if (error && error.code !== "23505") throw error;
}

export async function unfavoriteSnippet(userId: string, snippetId: string) {
  const { error } = await supabase
    .from("snippet_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("snippet_id", snippetId);
  if (error) throw error;
}

export async function recordRun(input: {
  user_id: string;
  language: string;
  source: string;
  output: string;
  success: boolean;
}) {
  const { error } = await supabase.from("run_history").insert(input);
  if (error) throw error;
}

export async function listRunHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("run_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
