# Emerald Isle Manpower — Next.js Migration

This repository contains the redesigned Emerald Isle Manpower website, a
private content dashboard for staff, and the database schema for vacancies and
candidate applications.

The project was migrated from a React/Vite frontend with hardcoded vacancy data
to a Next.js application with SEO-friendly routes and a Supabase-backed content
system.

## What changed

### Framework migration

The public website now uses Next.js App Router.

Changed:

- Replaced the Vite entry point with Next.js layouts and route files.
- Added server-rendered route pages under `src/app/`.
- Added Next.js metadata for titles, descriptions, canonical URLs, Open Graph,
  and Twitter cards.
- Added dynamic `robots.txt` and `sitemap.xml` generation.
- Added redirects for the previous contact URL aliases.
- Preserved the existing public URL structure wherever possible.
- Added dynamic job detail pages under:

  ```text
  /foreign-job-vacancies/[slug]/
  ```

- Added `JobPosting` structured data to job detail pages.
- Added server-side loading of published jobs from Supabase.
- Kept fallback vacancy data so the website can still render before Supabase is
  configured.

The old Vite-only files were removed because they are no longer the application
entry point:

- `index.html`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/lib/seo.ts`
- `vite.config.ts`
- `vercel.json`
- `scripts/generate-route-pages.mjs`

### Public website

The existing page experiences and visual components were kept and adapted to
Next.js:

- Home page
- About page
- Employer solutions
- Contact page
- Projects page
- FAQ page
- Blog page
- Foreign job vacancies
- Job detail pages

Client-only features were marked as client components where they use browser
APIs, animation, maps, or interactive state. The contact map is loaded without
server rendering because Leaflet requires the browser environment.

### Staff dashboard

A separate Next.js application was added in `dashboard/`.

The dashboard includes:

- Staff login using Supabase Authentication
- Staff roles: admin, editor, and viewer
- Job creation
- Job editing
- Draft, published, paused, and expired states
- Urgent and featured vacancy flags
- Job expiry dates
- Vacancy publishing controls
- Candidate application list
- Application status updates
- Short-lived private CV links for staff

The dashboard should eventually be deployed at:

```text
https://admin.emeraldislemanpower.com
```

The dashboard is not indexed by search engines.

### Database and storage

The project uses Supabase instead of the existing WordPress MySQL database.
Supabase provides:

- PostgreSQL database
- Staff authentication
- Row-level security
- Candidate CV storage
- Public database API access for published jobs

The database migration is located at:

```text
supabase/migrations/202607310001_initial_content_system.sql
```

The migration creates:

- `profiles`
- `jobs`
- `applications`
- Job and application indexes
- Staff role security functions
- Row-level security policies
- `job-media` storage bucket
- Private `candidate-cvs` storage bucket

The existing WordPress/MySQL database is not modified. This allows the current
WordPress site to remain available as a backup during migration.

### Application handling

The old PHP application handler was removed:

```text
public/apply.php
```

Applications are now sent to the Next.js endpoint:

```text
POST /api/applications
```

The endpoint validates the applicant details and CV, uploads the CV to private
Supabase storage, and creates an application record in PostgreSQL.

## Project structure

```text
EIMTS-Website/
├── src/                         # Public Next.js website
│   ├── app/                     # Routes, metadata, sitemap, API endpoints
│   ├── components/              # Shared layout, UI, and job components
│   ├── features/                # Home, jobs, about, contact, blog, etc.
│   ├── lib/                     # Site metadata and database queries
│   └── styles/                  # Global and page styles
├── public/                      # Images, videos, logos, and static assets
├── dashboard/                   # Private staff dashboard Next.js app
│   └── src/
│       ├── app/                 # Dashboard pages and server actions
│       ├── components/          # Dashboard header, forms, setup UI
│       └── lib/supabase/        # Browser and server Supabase clients
├── packages/database/           # Shared database TypeScript contracts
├── supabase/migrations/         # PostgreSQL schema and security policies
├── docs/                        # Architecture and migration documentation
├── next.config.ts               # Public Next.js configuration
├── package.json                 # Workspace scripts and dependencies
└── .env.example                # Public website environment template
```

## Local development

Install all workspace dependencies:

```bash
npm install
```

Run the public website:

```bash
npm run dev
```

The public website runs on the default Next.js development port.

Run the staff dashboard:

```bash
npm run dev:dashboard
```

The dashboard runs on port `3001`.

## Environment setup

Create the public environment file:

```text
.env.local
```

Use `.env.example` as the template:

```env
NEXT_PUBLIC_SITE_URL=https://emeraldislemanpower.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Create the dashboard environment file:

```text
dashboard/.env.local
```

Use `dashboard/.env.example` as the template:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The same Supabase project values are used by both applications.

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run:

   ```text
   supabase/migrations/202607310001_initial_content_system.sql
   ```

4. Add the Supabase values to both environment files.
5. Create the first staff account in Supabase Authentication.
6. Promote the first staff account to administrator:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (
     select id
     from auth.users
     where email = 'your-staff-email@example.com'
   );
   ```

7. Sign in at the dashboard.
8. Create a draft vacancy.
9. Publish the vacancy.
10. Confirm that it appears on the public vacancies page.

## Staff publishing workflow

```text
Staff member signs in
        ↓
Creates a vacancy
        ↓
Saves it as draft
        ↓
Reviews and publishes
        ↓
Public website displays the job
        ↓
Candidate applies and uploads CV
        ↓
Staff reviews application in dashboard
```

## SEO protection

The migration includes the following SEO protections:

- Existing important public URLs are preserved.
- Contact URL aliases redirect to the canonical contact URL.
- Page titles and descriptions are defined per route.
- Canonical URLs are generated for each page.
- `robots.txt` is generated by Next.js.
- `sitemap.xml` is generated by Next.js.
- Published job slugs are included in the sitemap.
- Each published job has its own indexable page.
- Job pages include `JobPosting` structured data.
- The dashboard is marked `noindex`.
- Expired and unpublished jobs are excluded from the public listing.

Before launch, every indexed WordPress URL must be compared against the new
route list and redirected where necessary. Use:

```text
docs/MIGRATION-CHECKLIST.md
```

## Validation

Run TypeScript checks for both applications:

```bash
npm run lint
```

Run both production builds:

```bash
npm run build
```

The build produces:

- The public Next.js production build
- The dashboard Next.js production build

## Deployment shape

Recommended production arrangement:

```text
emeraldislemanpower.com        Public Next.js website
admin.emeraldislemanpower.com  Private staff dashboard
Supabase                       Database, authentication, and storage
```

The domain can remain registered with Hostinger. The hosting plan must support
running Next.js applications, or the DNS can point the domain and dashboard
subdomain to a Next.js-compatible hosting provider.

## Not completed yet

The following work must happen before production launch:

- Create the Supabase project.
- Run the database migration.
- Configure environment variables.
- Import existing WordPress jobs and content.
- Build a complete WordPress URL redirect map.
- Add CAPTCHA or Turnstile protection to the public application endpoint.
- Configure email notifications for new applications.
- Test CV storage and staff access with real accounts.
- Confirm Hostinger or the selected host supports Next.js runtime deployment.
- Submit the new sitemap to Google Search Console.
- Monitor rankings, crawl errors, and applications after launch.

## Important free-plan note

The free database option is suitable for the first version, but it should not be
treated as a permanent backup strategy. Candidate CVs are sensitive data, so
production operations should eventually include regular backups, retention
rules, access reviews, and a paid or self-managed storage plan when usage grows.
