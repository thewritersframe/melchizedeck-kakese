
CREATE POLICY "admin upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "admin update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "admin delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "admin read media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
