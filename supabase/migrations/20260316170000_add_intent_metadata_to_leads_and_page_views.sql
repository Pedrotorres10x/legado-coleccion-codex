alter table public.leads
add column if not exists metadata jsonb;

alter table public.page_views
add column if not exists metadata jsonb;
