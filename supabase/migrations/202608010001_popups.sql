create table public.popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  image_url text,
  link_url text,
  link_label text,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger popups_set_updated_at
before update on public.popups
for each row execute function public.set_updated_at();

alter table public.popups enable row level security;

create policy "Active popups are public"
on public.popups for select
to anon, authenticated
using (
  active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Staff can read popups"
on public.popups for select
to authenticated
using (public.is_staff());

create policy "Staff can create popups"
on public.popups for insert
to authenticated
with check (public.is_staff() and created_by = auth.uid());

create policy "Staff can update popups"
on public.popups for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Admins can delete popups"
on public.popups for delete
to authenticated
using (public.is_admin());
