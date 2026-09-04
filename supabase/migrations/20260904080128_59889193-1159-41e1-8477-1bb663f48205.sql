INSERT INTO public.page_sections (page, section_key, content) VALUES
('site', 'community', '{"eyebrow":"Join the family","title":"JOIN THE FAMILY","body":"Come along for the journey — new books, screenplays, essays and behind-the-scenes stories, straight to your inbox.","instagram":1155,"linkedin":822,"facebook":430,"threads":229,"whatsapp":23}'::jsonb)
ON CONFLICT (page, section_key) DO NOTHING;