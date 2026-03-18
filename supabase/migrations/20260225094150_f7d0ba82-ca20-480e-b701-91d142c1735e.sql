
-- Allow anonymous upserts to property_slugs (slug cache, no sensitive data)
DROP POLICY IF EXISTS "property_slugs_admin_insert" ON public.property_slugs;
DROP POLICY IF EXISTS "property_slugs_admin_update" ON public.property_slugs;

CREATE POLICY "property_slugs_anyone_insert"
  ON public.property_slugs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "property_slugs_anyone_update"
  ON public.property_slugs FOR UPDATE
  USING (true);
