create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  kicker text,
  title text not null,
  copy text not null,
  image_url text not null,
  cta_label text,
  cta_url text,
  cta2_label text,
  cta2_url text,
  sort_order integer not null default 0,
  is_takeover boolean not null default false,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger hero_slides_set_updated_at
before update on public.hero_slides
for each row execute function public.set_updated_at();

alter table public.hero_slides enable row level security;

create policy "Active hero slides are public"
on public.hero_slides for select
to anon, authenticated
using (
  active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Staff can read hero slides"
on public.hero_slides for select
to authenticated
using (public.is_staff());

create policy "Staff can create hero slides"
on public.hero_slides for insert
to authenticated
with check (public.is_staff() and created_by = auth.uid());

create policy "Staff can update hero slides"
on public.hero_slides for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Admins can delete hero slides"
on public.hero_slides for delete
to authenticated
using (public.is_admin());

-- Seed the three slides that were previously hardcoded in the homepage so the
-- website looks identical the moment the dashboard takes over as the source of
-- truth. Image paths point at files bundled with the public site.
insert into public.hero_slides
  (kicker, title, copy, image_url, cta_label, cta_url, cta2_label, cta2_url, sort_order, active)
values
  (
    'Trusted in Sri Lanka since 1995',
    '32+ years of connecting Sri Lankan talent with global opportunity.',
    'Responsible overseas recruitment, documentation and travel guidance, supported by one accountable team.',
    '/assets/emerald-journey-hero.webp',
    'Explore foreign jobs', '/foreign-job-vacancies/',
    'Hire exceptional talent', '/client-recruitment-solutions/',
    10, true
  ),
  (
    'Trusted recruitment. Stronger teams.',
    'Exceptional people build stronger businesses.',
    'Industry-focused recruitment connecting respected employers with carefully screened talent.',
    '/assets/hero-employer-partnership.webp',
    'Explore foreign jobs', '/foreign-job-vacancies/',
    'Hire exceptional talent', '/client-recruitment-solutions/',
    20, true
  ),
  (
    'From application to arrival.',
    'Every overseas journey deserves clear guidance.',
    'Recruitment, documentation and travel support brought together by one accountable team.',
    '/assets/hero-travel-guidance.webp',
    'Explore foreign jobs', '/foreign-job-vacancies/',
    'Hire exceptional talent', '/client-recruitment-solutions/',
    30, true
  );
