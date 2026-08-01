CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_ref TEXT NOT NULL UNIQUE DEFAULT ('DON-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  message TEXT,
  provider TEXT NOT NULL DEFAULT 'selcom',
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view donations"
ON public.donations FOR SELECT TO authenticated
USING (public.is_admin());

CREATE TRIGGER donations_touch_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE INDEX donations_created_at_idx ON public.donations (created_at DESC);