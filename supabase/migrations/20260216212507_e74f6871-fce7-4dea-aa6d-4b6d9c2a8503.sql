
-- Add views counter to blog posts
ALTER TABLE public.blog_posts ADD COLUMN views INTEGER NOT NULL DEFAULT 0;

-- Function to increment views (avoids race conditions)
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts SET views = views + 1 WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
