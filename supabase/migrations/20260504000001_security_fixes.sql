-- ─────────────────────────────────────────────────────────────────────────────
-- Security fixes  2026-05-04
-- 1. Storage property-images: restrict write access to admins only
-- 2. Newsletter subscribers: remove USING(true) unsubscribe policy
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Storage: restrict uploads to admins ──────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- ── 2. Newsletter: remove public unsubscribe policy ─────────────────────────
-- The USING(true) allowed any anonymous caller to mark any subscriber as
-- inactive by knowing their email. Unsubscribes must go through the
-- unsubscribe-newsletter Edge Function (service_role, token-validated).

DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.newsletter_subscribers;
