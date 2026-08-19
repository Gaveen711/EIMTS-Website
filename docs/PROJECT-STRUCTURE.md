# Project Structure

## Public website

The public Next.js application remains at the repository root.

| Need | Location |
| --- | --- |
| Public routes and SEO metadata | `src/app/` |
| Existing page experiences | `src/features/` |
| Shared public components | `src/components/` |
| Public database queries | `src/lib/jobs.ts` |
| Global visual styling | `src/styles/` |
| Public images and files | `public/` |

Every indexable route is represented by a Next.js `page.tsx`. Job detail pages
are generated at `/foreign-job-vacancies/[slug]/`, with per-job metadata and
`JobPosting` structured data.

## Staff dashboard

The separate Next.js dashboard lives in `dashboard/` and is intended to be
deployed to `admin.emeraldislemanpower.com`.

| Need | Location |
| --- | --- |
| Dashboard pages | `dashboard/src/app/` |
| Job create/edit form | `dashboard/src/components/JobForm.tsx` |
| Candidate application review | `dashboard/src/app/applications/` |
| Protected publishing actions | `dashboard/src/app/actions.ts` |
| Dashboard Supabase clients | `dashboard/src/lib/supabase/` |

## Database

Supabase supplies PostgreSQL, authentication and file storage. The SQL migration
in `supabase/migrations/` creates jobs, applications, profiles, security
policies and storage buckets. The existing WordPress/MySQL database is not
modified.

Shared TypeScript database contracts live in `packages/database/`.

## Deployment shape
 
```text
emeraldislemanpower.com       public Next.js website (Vercel: eimts-website)
admin.emeraldislemanpower.com private Next.js dashboard (Vercel: eimts-website-dashboard)
Supabase                       database, staff authentication and storage
```

The public site and dashboard use the same Supabase project but have different
deployment surfaces. Database security is enforced server-side through
row-level security, not only by hiding dashboard links.

### Deployment Commands (Vercel CLI)

- **Deploy Both (Root script)**: `npm run deploy`
- **Deploy Public Website Only**: `vercel --prod`
- **Deploy Dashboard Only**: `vercel --prod --project eimts-website-dashboard`

