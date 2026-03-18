-- 1. Inicia sesion una vez con Google en /admin para que el usuario exista en auth.users
-- 2. Sustituye el email por el del administrador real

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'admin@tu-dominio.com'
on conflict (user_id, role) do nothing;

-- Opcional: dejar autoasignacion para futuros admins por email
create or replace function public.assign_admin_on_signup()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.email in ('admin@tu-dominio.com') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.assign_admin_on_signup();
