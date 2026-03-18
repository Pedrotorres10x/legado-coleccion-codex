
-- Rate limit trigger for newsletter_subscribers (max 5 per email per hour)
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.newsletter_subscribers
  WHERE email = NEW.email
    AND subscribed_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'rate limit exceeded for this email'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER check_newsletter_rate_limit
BEFORE INSERT ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.check_newsletter_rate_limit();
