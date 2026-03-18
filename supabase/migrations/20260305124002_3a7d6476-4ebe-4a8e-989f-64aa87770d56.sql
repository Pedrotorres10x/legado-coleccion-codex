
-- Fix 1: property_slugs - restrict INSERT/UPDATE to admins and service_role
DROP POLICY IF EXISTS "property_slugs_anyone_insert" ON public.property_slugs;
DROP POLICY IF EXISTS "property_slugs_anyone_update" ON public.property_slugs;

CREATE POLICY "Admins can insert property slugs"
  ON public.property_slugs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update property slugs"
  ON public.property_slugs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: featured_cache - drop the permissive ALL policy that grants anon write
DROP POLICY IF EXISTS "Service role can manage featured cache" ON public.featured_cache;
