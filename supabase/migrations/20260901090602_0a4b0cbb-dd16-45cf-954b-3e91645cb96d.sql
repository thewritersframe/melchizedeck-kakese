-- LIKES
CREATE TABLE public.content_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  visitor_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, visitor_key)
);
GRANT SELECT, INSERT, DELETE ON public.content_likes TO anon, authenticated;
GRANT ALL ON public.content_likes TO service_role;
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read likes" ON public.content_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can like" ON public.content_likes FOR INSERT TO anon, authenticated WITH CHECK (length(visitor_key) BETWEEN 8 AND 100);
CREATE POLICY "anyone can unlike own device" ON public.content_likes FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX idx_content_likes_item ON public.content_likes(item_id);

-- COMMENTS
CREATE TABLE public.content_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_comments TO anon, authenticated;
GRANT DELETE, UPDATE ON public.content_comments TO authenticated;
GRANT ALL ON public.content_comments TO service_role;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read comments" ON public.content_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can comment" ON public.content_comments FOR INSERT TO anon, authenticated WITH CHECK (length(btrim(name)) BETWEEN 2 AND 80 AND length(btrim(body)) BETWEEN 2 AND 4000);
CREATE POLICY "admin delete comments" ON public.content_comments FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX idx_content_comments_item ON public.content_comments(item_id, created_at DESC);
CREATE TRIGGER trg_content_comments_touch BEFORE UPDATE ON public.content_comments FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- REVIEWS
CREATE TABLE public.content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating integer NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_reviews TO anon, authenticated;
GRANT DELETE, UPDATE ON public.content_reviews TO authenticated;
GRANT ALL ON public.content_reviews TO service_role;
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.content_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can review" ON public.content_reviews FOR INSERT TO anon, authenticated WITH CHECK (rating BETWEEN 1 AND 5 AND length(btrim(name)) BETWEEN 2 AND 80 AND (body IS NULL OR length(body) <= 4000));
CREATE POLICY "admin delete reviews" ON public.content_reviews FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX idx_content_reviews_item ON public.content_reviews(item_id, created_at DESC);
CREATE TRIGGER trg_content_reviews_touch BEFORE UPDATE ON public.content_reviews FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();