
-- COMMENTS
CREATE TABLE public.snippet_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_snippet ON public.snippet_comments(snippet_id, created_at DESC);

GRANT SELECT ON public.snippet_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.snippet_comments TO authenticated;
GRANT ALL ON public.snippet_comments TO service_role;

ALTER TABLE public.snippet_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments on visible snippets are viewable"
  ON public.snippet_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.snippets s
      WHERE s.id = snippet_id
        AND (s.visibility = 'public' OR s.owner_id = auth.uid())
    )
  );

CREATE POLICY "Signed-in users can comment on public snippets"
  ON public.snippet_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.snippets s
      WHERE s.id = snippet_id
        AND (s.visibility = 'public' OR s.owner_id = auth.uid())
    )
  );

CREATE POLICY "Authors can edit their own comments"
  ON public.snippet_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Author or snippet owner can delete a comment"
  ON public.snippet_comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.owner_id = auth.uid())
  );

CREATE TRIGGER update_snippet_comments_updated_at
  BEFORE UPDATE ON public.snippet_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- RATINGS
CREATE TABLE public.snippet_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snippet_id, user_id)
);
CREATE INDEX idx_ratings_snippet ON public.snippet_ratings(snippet_id);

GRANT SELECT ON public.snippet_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.snippet_ratings TO authenticated;
GRANT ALL ON public.snippet_ratings TO service_role;

ALTER TABLE public.snippet_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings on visible snippets are viewable"
  ON public.snippet_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.snippets s
      WHERE s.id = snippet_id
        AND (s.visibility = 'public' OR s.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can rate public snippets"
  ON public.snippet_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.snippets s WHERE s.id = snippet_id AND s.visibility = 'public')
  );

CREATE POLICY "Users can change their own rating"
  ON public.snippet_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own rating"
  ON public.snippet_ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_snippet_ratings_updated_at
  BEFORE UPDATE ON public.snippet_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications read"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);


-- TRIGGERS that generate notifications
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
BEGIN
  SELECT owner_id, title INTO v_owner, v_title FROM public.snippets WHERE id = NEW.snippet_id;
  IF v_owner IS NOT NULL AND v_owner <> NEW.author_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      v_owner,
      'comment',
      'New comment on "' || v_title || '"',
      left(NEW.body, 200),
      '/snippets/' || NEW.snippet_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.snippet_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();


CREATE OR REPLACE FUNCTION public.notify_on_favorite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
BEGIN
  SELECT owner_id, title INTO v_owner, v_title FROM public.snippets WHERE id = NEW.snippet_id;
  IF v_owner IS NOT NULL AND v_owner <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, link)
    VALUES (
      v_owner,
      'star',
      'Someone starred "' || v_title || '"',
      '/snippets/' || NEW.snippet_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_on_favorite() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_notify_on_favorite
  AFTER INSERT ON public.snippet_favorites
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_favorite();


-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can see their own subscription"
  ON public.newsletter_subscribers FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe themselves"
  ON public.newsletter_subscribers FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
