
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Page sections: JSON blob per (page, key). Editable by admin.
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, section_key)
);
GRANT SELECT ON public.page_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections" ON public.page_sections FOR SELECT USING (true);
CREATE POLICY "admin write sections" ON public.page_sections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_page_sections_touch BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Generic content items table for collections (books, blog posts, events, scripts, advocacy)
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection text NOT NULL, -- 'book' | 'blog' | 'event' | 'script' | 'advocacy'
  slug text,
  title text NOT NULL,
  subtitle text,
  body text,
  image_url text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. { date, location, buy_url, tags }
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_items_collection_idx ON public.content_items(collection, sort_order);
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published items" ON public.content_items FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "admin write items" ON public.content_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_content_items_touch BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Newsletter subscribers (public insert only)
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin can delete subscribers" ON public.subscribers FOR DELETE TO authenticated USING (public.is_admin());

-- Contact / partner messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  body text NOT NULL,
  kind text NOT NULL DEFAULT 'contact', -- 'contact' | 'partner'
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can read messages" ON public.messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin can delete messages" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

-- Seed page sections with defaults matching the reference site
INSERT INTO public.page_sections (page, section_key, content) VALUES
  ('home', 'hero', '{"eyebrow":"Writer · Youth Advocate · Global Changemaker","title":"Melchizedeck Kakese","subtitle":"Tanzanian-born Hollywood-accredited scriptwriter, published author, and youth advocate using storytelling as a tool for social impact across Africa and beyond.","ctaPrimaryLabel":"Explore Books","ctaPrimaryTo":"/books","ctaSecondaryLabel":"Read My Essays","ctaSecondaryTo":"/blog"}'::jsonb),
  ('home', 'featured', '{"label":"Featured Work","title":"Deadman''s Correspondence to Alkebulan","body":"A haunting epistolary journey through the soul of a continent. This debut work weaves together themes of identity, loss, and the enduring spirit of Africa — told through letters that were never meant to be found.","imageUrl":"","primaryLabel":"Learn More","primaryTo":"/books","secondaryLabel":"Read Sample","secondaryTo":"/books"}'::jsonb),
  ('home', 'pillars', '{"title":"What Drives the Work","items":[{"title":"Writing","body":"Long-form fiction and non-fiction exploring African identity, science, and the human condition."},{"title":"Essays & Thought","body":"Academic reflections and cultural commentary bridging African perspectives with global discourse."},{"title":"Innovation","body":"Pursuing knowledge at the intersection of technology, education, and creative problem-solving."}]}'::jsonb),
  ('home', 'newsletter', '{"title":"Join the Journey","body":"Get notified about new essays, book releases, and reflections. No spam — only words that matter."}'::jsonb),
  ('about', 'main', '{"title":"About Melchizedeck","body":"Melchizedeck Kakese is a Tanzanian-born writer, Hollywood-accredited scriptwriter, and youth advocate whose work sits at the intersection of storytelling and social change. His writing explores African identity, memory, and futures.","imageUrl":""}'::jsonb),
  ('scripts', 'header', '{"title":"Scripts","body":"Screenplays and teleplays for film and television."}'::jsonb),
  ('books', 'header', '{"title":"Books","body":"Long-form fiction and non-fiction."}'::jsonb),
  ('blog', 'header', '{"title":"Essays & Reflections","body":"Cultural commentary and academic reflections."}'::jsonb),
  ('events', 'header', '{"title":"Events","body":"Speaking engagements, readings, and workshops."}'::jsonb),
  ('advocacy', 'header', '{"title":"Advocacy & Adventures","body":"Youth advocacy work and stories from the road."}'::jsonb),
  ('contact', 'main', '{"title":"Contact & Partner","body":"For collaborations, speaking, or partnerships, send a note below.","email":"","location":""}'::jsonb),
  ('site', 'footer', '{"tagline":"Words that move continents.","copyright":"© Melchizedeck Kakese. All rights reserved."}'::jsonb)
ON CONFLICT (page, section_key) DO NOTHING;

-- Seed a featured book
INSERT INTO public.content_items (collection, slug, title, subtitle, body, sort_order, meta) VALUES
  ('book','deadmans-correspondence','Deadman''s Correspondence to Alkebulan','A debut epistolary novel','A haunting epistolary journey through the soul of a continent, told through letters never meant to be found.',0,'{"buy_url":""}'::jsonb)
ON CONFLICT DO NOTHING;
