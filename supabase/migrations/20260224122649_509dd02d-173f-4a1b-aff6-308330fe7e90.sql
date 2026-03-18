-- Remove overly permissive write policies on property_slugs
DROP POLICY IF EXISTS "property_slugs_anon_insert" ON public.property_slugs;
DROP POLICY IF EXISTS "property_slugs_anon_update" ON public.property_slugs;

-- Allow writes only for authenticated admin users
CREATE POLICY "property_slugs_admin_insert" ON public.property_slugs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "property_slugs_admin_update" ON public.property_slugs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));