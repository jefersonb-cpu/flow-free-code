-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audit log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log" ON public.admin_audit_log
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins write audit log" ON public.admin_audit_log
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') AND actor_id = auth.uid());

-- Feature flags
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags
FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Site announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warning','success','danger')),
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active announcements" ON public.announcements
FOR SELECT USING (active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Admins read all announcements" ON public.announcements
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements
FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles, contact messages, appointments, subscriptions, snippets via new policies
CREATE POLICY "Admins view all contact messages" ON public.contact_messages
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contact messages" ON public.contact_messages
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all appointments" ON public.appointments
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update appointments" ON public.appointments
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all subscriptions" ON public.user_subscriptions
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update subscriptions" ON public.user_subscriptions
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view newsletter subs" ON public.newsletter_subscribers
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete newsletter subs" ON public.newsletter_subscribers
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all snippets" ON public.snippets
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete any snippet" ON public.snippets
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update plans" ON public.subscription_plans
FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default feature flags
INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('voice_input', true, 'Enable voice dictation in editor'),
  ('comments', true, 'Enable comments on public snippets'),
  ('ratings', true, 'Enable star ratings'),
  ('signups', true, 'Allow new user signups')
ON CONFLICT (key) DO NOTHING;
