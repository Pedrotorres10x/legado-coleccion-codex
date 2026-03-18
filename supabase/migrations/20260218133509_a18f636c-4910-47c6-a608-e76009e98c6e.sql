-- Eliminar la política DELETE pública de push_subscriptions
-- La limpieza de suscripciones expiradas se hace via service_role (bypass RLS)
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;
