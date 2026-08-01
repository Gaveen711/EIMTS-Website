create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer'
    check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  country text not null,
  location text,
  category text not null,
  employment_type text not null default 'Full-time',
  salary_min numeric(12, 2),
  salary_max numeric(12, 2),
  currency char(3) not null default 'LKR',
  summary text not null,
  description text not null,
  requirements text[] not null default '{}',
  image_url text,
  image_position text not null default '50% 50%',
  urgent boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'paused', 'expired')),
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete restrict,
  full_name text not null,
  age integer not null check (age between 18 and 99),
  email text not null,
  phone text,
  cv_path text not null,
  cover_note text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_public_listing_idx
  on public.jobs(status, urgent desc, published_at desc);
create index jobs_country_idx on public.jobs(country);
create index jobs_category_idx on public.jobs(category);
create index applications_job_idx on public.applications(job_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy "Profiles can read themselves"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_staff());

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Published jobs are public"
on public.jobs for select
to anon, authenticated
using (
  status = 'published'
  and (expires_at is null or expires_at >= now())
);

create policy "Staff can read every job"
on public.jobs for select
to authenticated
using (public.is_staff());

create policy "Staff can create jobs"
on public.jobs for insert
to authenticated
with check (public.is_staff() and created_by = auth.uid());

create policy "Staff can update jobs"
on public.jobs for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Admins can delete jobs"
on public.jobs for delete
to authenticated
using (
  public.is_admin()
);

create policy "Visitors can submit applications"
on public.applications for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.jobs
    where jobs.id = job_id
      and jobs.status = 'published'
      and (jobs.expires_at is null or jobs.expires_at >= now())
  )
);

create policy "Staff can read applications"
on public.applications for select
to authenticated
using (public.is_staff());

create policy "Staff can update applications"
on public.applications for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('job-media', 'job-media', true, 5242880),
  ('candidate-cvs', 'candidate-cvs', false, 5242880)
on conflict (id) do nothing;

create policy "Public job media is readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'job-media');

create policy "Staff can manage job media"
on storage.objects for all
to authenticated
using (bucket_id = 'job-media' and public.is_staff())
with check (bucket_id = 'job-media' and public.is_staff());

create policy "Visitors can upload candidate CVs"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'candidate-cvs'
  and exists (
    select 1
    from public.jobs
    where jobs.id::text = (storage.foldername(name))[1]
      and jobs.status = 'published'
      and (jobs.expires_at is null or jobs.expires_at >= now())
  )
);

create policy "Staff can read candidate CVs"
on storage.objects for select
to authenticated
using (bucket_id = 'candidate-cvs' and public.is_staff());
