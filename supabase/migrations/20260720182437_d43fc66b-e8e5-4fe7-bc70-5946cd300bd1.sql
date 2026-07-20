
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  item_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  item_title text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TZS',
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'selcom',
  provider_ref text,
  order_ref text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  bundle_expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT SELECT, INSERT ON public.purchases TO anon;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create pending purchase" ON public.purchases FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "admin read all purchases" ON public.purchases FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin update purchases" ON public.purchases FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete purchases" ON public.purchases FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER trg_touch_purchases BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'purchase',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, item_id)
);
GRANT SELECT ON public.unlocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unlocks TO authenticated;
GRANT ALL ON public.unlocks TO service_role;
ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;
-- Public reads are fine: knowing an email has unlocked a title is not sensitive; access is per-item and gated in the app by email verification. Users query by their own email.
CREATE POLICY "public read unlocks" ON public.unlocks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write unlocks" ON public.unlocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_touch_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.site_settings (key, value) VALUES
  ('payments', '{"standard_price": 10000, "currency": "TZS", "bundle_minutes": 60, "bundle_free_picks": 1, "notify_email": "melchizedeckkakese@gmail.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
