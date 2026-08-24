create or replace function public.project_gallery_is_valid(gallery jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(gallery) <> 'array' then false
    else not exists (
      select 1
      from jsonb_array_elements(gallery) as gallery_item(image)
      where jsonb_typeof(image) <> 'object'
        or coalesce(image ->> 'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        or coalesce(image ->> 'image_url', '') !~* '\.webp$'
        or (
          nullif(image ->> 'storage_path', '') is not null
          and (image ->> 'storage_path') !~* '^projects/[0-9a-f-]{36}\.webp$'
        )
        or btrim(coalesce(image ->> 'alt_text', '')) = ''
    )
  end;
$$;

create or replace function public.project_gallery_has_image(
  gallery jsonb,
  image_id uuid
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(gallery) <> 'array' then false
    else exists (
      select 1
      from jsonb_array_elements(gallery) as gallery_item(image)
      where image ->> 'id' = image_id::text
    )
  end;
$$;

revoke execute on function public.project_gallery_is_valid(jsonb)
  from public, anon;
revoke execute on function public.project_gallery_has_image(jsonb, uuid)
  from public, anon;
grant execute on function public.project_gallery_is_valid(jsonb)
  to authenticated, service_role;
grant execute on function public.project_gallery_has_image(jsonb, uuid)
  to authenticated, service_role;

-- The Dashboard SQL editor may be used to recover from a partially applied
-- script, so every top-level object below can be recreated safely.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  country text not null,
  client text not null,
  images jsonb not null
    check (jsonb_typeof(images) = 'array')
    check (jsonb_array_length(images) between 1 and 30)
    check (public.project_gallery_is_valid(images)),
  hero_image_id uuid not null,
  hero_position_x smallint not null default 50
    check (hero_position_x between 0 and 100),
  hero_position_y smallint not null default 50
    check (hero_position_y between 0 and 100),
  sort_order integer not null default 0
    check (sort_order >= 0),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_hero_image_present'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_hero_image_present
      check (public.project_gallery_has_image(images, hero_image_id));
  end if;
end
$$;

create index if not exists projects_public_order_idx
  on public.projects(active, sort_order, created_at);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "Active projects are public" on public.projects;
create policy "Active projects are public"
on public.projects for select
to anon, authenticated
using (active);

drop policy if exists "Staff can read every project" on public.projects;
create policy "Staff can read every project"
on public.projects for select
to authenticated
using ((select public.is_staff()));

drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects"
on public.projects for insert
to authenticated
with check (
  (select public.is_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
on public.projects for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
on public.projects for delete
to authenticated
using ((select public.is_admin()));

-- New public-schema tables are no longer guaranteed to be exposed to the
-- Data API, so grant only the operations each client role actually needs.
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-media',
  'project-media',
  true,
  5242880,
  array['image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets can be read through their public object URLs without a
-- storage.objects SELECT policy. Remove the older redundant policy because it
-- also permits bucket listing through the Data API.
drop policy if exists "Public project media is readable" on storage.objects;

drop policy if exists "Admins can manage project media" on storage.objects;
create policy "Admins can manage project media"
on storage.objects for all
to authenticated
using (
  bucket_id = 'project-media'
  and (select public.is_admin())
)
with check (
  bucket_id = 'project-media'
  and (select public.is_admin())
);

-- Seed the projects currently bundled with the website. These WebP URLs keep
-- the existing page intact immediately after migration; replacing an image in
-- the dashboard moves that file into the project-media bucket.
insert into public.projects (
  id,
  slug,
  name,
  country,
  client,
  images,
  hero_image_id,
  hero_position_x,
  hero_position_y,
  sort_order,
  active
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'al-mahmal',
    'Saudi Arabia Al Mahmal',
    'Saudi Arabia',
    'Al Mahmal',
    jsonb_build_array(
      jsonb_build_object(
        'id', '11000000-0000-4000-8000-000000000001',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/saudi-al-mahmal/training.webp',
        'storage_path', null,
        'alt_text', 'Saudi Arabia Al Mahmal workforce training'
      ),
      jsonb_build_object(
        'id', '11000000-0000-4000-8000-000000000002',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/saudi-al-mahmal/interview.webp',
        'storage_path', null,
        'alt_text', 'Saudi Arabia Al Mahmal project interview'
      )
    ),
    '11000000-0000-4000-8000-000000000001',
    30,
    45,
    10,
    true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'mcdonalds-kuwait',
    'McDonalds Kuwait',
    'Kuwait',
    'McDonalds',
    jsonb_build_array(
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000001',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/interview.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait candidate interview'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000002',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/briefing-1.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait candidate briefing'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000003',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/team-1.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait project team'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000004',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/team-2.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait recruitment team'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000005',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/team-3.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait project group'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000006',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/team-4.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait project participants'
      ),
      jsonb_build_object(
        'id', '12000000-0000-4000-8000-000000000007',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/mcdonalds-kuwait/briefing-2.webp',
        'storage_path', null,
        'alt_text', 'McDonalds Kuwait group briefing'
      )
    ),
    '12000000-0000-4000-8000-000000000001',
    42,
    40,
    20,
    true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'qatar-compass',
    'Qatar Compass',
    'Qatar',
    'Qatar Compass',
    jsonb_build_array(
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000001',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/arrival.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass workforce arrival'
      ),
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000002',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/briefing.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass project briefing'
      ),
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000003',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/team-1.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass project team'
      ),
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000004',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/team-2.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass project group'
      ),
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000005',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/team-3.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass candidates'
      ),
      jsonb_build_object(
        'id', '13000000-0000-4000-8000-000000000006',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/qatar-compass/team-4.webp',
        'storage_path', null,
        'alt_text', 'Qatar Compass project participants'
      )
    ),
    '13000000-0000-4000-8000-000000000002',
    28,
    45,
    30,
    true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'uae-almasaood',
    'UAE AL Masaood',
    'United Arab Emirates',
    'AL Masaood',
    jsonb_build_array(
      jsonb_build_object(
        'id', '14000000-0000-4000-8000-000000000001',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/uae-almasaood/briefing.webp',
        'storage_path', null,
        'alt_text', 'UAE AL Masaood project briefing'
      ),
      jsonb_build_object(
        'id', '14000000-0000-4000-8000-000000000002',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/uae-almasaood/workshop.webp',
        'storage_path', null,
        'alt_text', 'UAE AL Masaood workplace workshop'
      ),
      jsonb_build_object(
        'id', '14000000-0000-4000-8000-000000000003',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/uae-almasaood/inspection.webp',
        'storage_path', null,
        'alt_text', 'UAE AL Masaood vehicle inspection'
      ),
      jsonb_build_object(
        'id', '14000000-0000-4000-8000-000000000004',
        'image_url', 'https://emeraldislemanpower.com/assets/projects/uae-almasaood/site.webp',
        'storage_path', null,
        'alt_text', 'UAE AL Masaood project site visit'
      )
    ),
    '14000000-0000-4000-8000-000000000004',
    72,
    40,
    40,
    true
  )
on conflict do nothing;
