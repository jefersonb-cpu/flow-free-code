
CREATE TABLE public.snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  source TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')),
  forked_from UUID REFERENCES public.snippets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_snippets_owner ON public.snippets(owner_id);
CREATE INDEX idx_snippets_visibility ON public.snippets(visibility);

GRANT SELECT ON public.snippets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.snippets TO authenticated;
GRANT ALL ON public.snippets TO service_role;

ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public snippets are viewable by everyone"
  ON public.snippets FOR SELECT
  USING (visibility = 'public' OR auth.uid() = owner_id);

CREATE POLICY "Users can create their own snippets"
  ON public.snippets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their snippets"
  ON public.snippets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their snippets"
  ON public.snippets FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON public.snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.snippet_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, snippet_id)
);
CREATE INDEX idx_favorites_snippet ON public.snippet_favorites(snippet_id);

GRANT SELECT, INSERT, DELETE ON public.snippet_favorites TO authenticated;
GRANT ALL ON public.snippet_favorites TO service_role;

ALTER TABLE public.snippet_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.snippet_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.snippet_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.snippet_favorites FOR DELETE
  USING (auth.uid() = user_id);


CREATE TABLE public.run_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  source TEXT NOT NULL,
  output TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_run_history_user_created ON public.run_history(user_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.run_history TO authenticated;
GRANT ALL ON public.run_history TO service_role;

ALTER TABLE public.run_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own run history"
  ON public.run_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own runs"
  ON public.run_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own runs"
  ON public.run_history FOR DELETE
  USING (auth.uid() = user_id);
