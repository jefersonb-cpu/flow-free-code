
-- Contact form messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND char_length(subject) BETWEEN 1 AND 200
    AND char_length(message) BETWEEN 1 AND 5000
  );

CREATE POLICY "Users can view their own messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Appointment booking
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments"
  ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can book their appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND scheduled_for > now()
    AND duration_minutes BETWEEN 15 AND 240
  );
CREATE POLICY "Users can update their appointments"
  ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel their appointments"
  ON public.appointments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Subscription plans (public catalog) + user subscriptions
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly_cents INTEGER NOT NULL,
  price_yearly_cents INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON public.subscription_plans FOR SELECT USING (true);

INSERT INTO public.subscription_plans (slug, name, description, price_monthly_cents, price_yearly_cents, features, is_featured, sort_order) VALUES
  ('free', 'Free', 'Everything you need to learn Prosa.', 0, 0,
    '["Unlimited public snippets","Run history (last 50)","Community support","All 8 languages"]'::jsonb, false, 1),
  ('pro', 'Pro', 'For power users and small teams.', 900, 9000,
    '["Unlimited private snippets","Unlimited run history","Priority support","Analytics dashboard","Export to JSON / Markdown"]'::jsonb, true, 2),
  ('team', 'Team', 'Collaborate across your organization.', 2900, 29000,
    '["Everything in Pro","Up to 10 seats","Shared snippet libraries","SSO (SAML)","Audit logs","Dedicated success manager"]'::jsonb, false, 3);

CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL DEFAULT 'free',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their subscription"
  ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create their subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND billing_cycle IN ('monthly','yearly'));
CREATE POLICY "Users update their subscription"
  ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
