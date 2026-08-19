# Emerald Isle Manpower & Travel Services (EIMTS)

This repository contains the Next.js web ecosystem for Emerald Isle Manpower & Travel Services: the high-performance public marketing and job board website, a private staff content dashboard, shared database contracts, and the Supabase database schema for vacancies, popups, hero slides, and candidate applications.

The platform was migrated from a static React/Vite frontend with hardcoded vacancy data and WordPress/PHP dependencies to a modern, SEO-optimised Next.js application backed by Supabase and automated email notifications.

---

## Workspace Structure

This monorepo uses npm workspaces:

```text
EIMTS-Website/
├── src/                         # Public Next.js website
│   ├── app/                     # App Router pages, metadata, sitemap, API endpoints
│   ├── components/              # Shared layout, UI, and job application components
│   ├── features/                # Domain views (Home, Jobs, About, Employers, Contact, Blog, etc.)
│   ├── lib/                     # Supabase data queries, SEO metadata, and email delivery
│   └── styles/                  # Global design tokens and page styles
├── public/                      # Static brand assets, images, and documents
├── dashboard/                   # Private staff content dashboard (Next.js App Router)
│   └── src/
│       ├── app/                 # Dashboard pages (Jobs, Hero slides, Popups, Applications, Login)
│       ├── components/          # Forms, layout header, authentication & setup UI
│       └── lib/supabase/        # Supabase SSR server and browser client setup
├── packages/database/           # Shared TypeScript types and database contracts (@eimts/database)
├── supabase/migrations/         # PostgreSQL schema, RLS policies, triggers, and storage buckets
├── docs/                        # Architecture, design system, and migration guides
├── next.config.ts               # Public website Next.js configuration
├── package.json                 # Monorepo root workspace scripts and dependencies
└── .env.example                 # Public website environment template
```

---

## Features Overview

### 1. Public Website (`src/`)
- **Next.js App Router**: Fast server-side rendering (SSR), dynamic metadata, open graph tags, and automatic XML sitemaps (`sitemap.xml`) & `robots.txt`.
- **Dynamic Vacancy System**: Server-side loading of published jobs from Supabase with fallback data ensuring the site stays resilient.
- **Dynamic Job Pages**: Individual job detail routes under `/foreign-job-vacancies/[slug]/` with schema.org `JobPosting` structured data.
- **Candidate Online Applications**: Secure candidate application form (`POST /api/applications`) validating applicant information, age, email, and CV file upload (PDF/Word up to 5 MB).
- **Automated Recruitment Email Notifications**: Automatic email delivery with CV attachment via Nodemailer/SMTP to recruitment team inboxes.
- **Dynamic Hero Slides & Popups**: Homepage hero carousel and seasonal takeover banners managed directly via the dashboard.
- **Interactive Visuals**: Interactive office map via Leaflet and motion effects via Framer Motion & Three.js.

### 2. Private Staff Content Dashboard (`dashboard/`)
- **Dedicated Next.js Workspace**: Separate application designed for `admin.emeraldislemanpower.com` (or local port `3001`).
- **Role-Based Access Control**: Staff roles (`admin`, `editor`, `viewer`) enforced via Supabase Authentication and PostgreSQL Row-Level Security (RLS).
- **Job Management**: Create, edit, draft, publish, pause, and expire vacancy listings, with urgent/featured flags and expiry scheduling.
- **Hero Carousel & Takeovers**: Manage hero carousel slides, sort ordering, active time windows, and full hero takeovers (e.g. for anniversaries, holidays, or major announcements).
- **Promotional Popups**: Create and schedule modal popups with custom banners, CTAs, and active timeframes.
- **Candidate Applications Review**: View candidate submissions, application statuses, job snapshots, and generate short-lived signed URLs to view candidate CVs.
- **SEO-Protected**: Excluded from search engines (`noindex, nofollow`).

### 3. Database & Storage (`supabase/`)
- **PostgreSQL Database** with full Row-Level Security (RLS).
- **Storage Buckets**:
  - `job-media`: Public bucket for job posters and promotional banners.
  - `candidate-cvs`: Private, secure storage for applicant CVs accessible only by authenticated staff members.
- **Automated Triggers**: Auto-updates timestamps and snapshots vacancy titles on candidate application records.

---

## Getting Started

### Prerequisites
- Node.js `>= 20.9.0`
- npm `>= 10.0.0`

### Installation

Install dependencies across all workspaces from the project root:

```bash
npm install
```

### Local Development

Run the public website (runs on `http://localhost:3000`):

```bash
npm run dev
```

Run the staff dashboard (runs on `http://localhost:3001`):

```bash
npm run dev:dashboard
```

Run both in parallel or use separate terminal sessions.

---

## Environment Variables

### 1. Public Website (`.env.local`)

Copy `.env.example` to `.env.local` in the root directory:

```env
NEXT_PUBLIC_SITE_URL=https://emeraldislemanpower.com
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-publishable-key>

# Application email delivery (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=recruitment@emeraldisle.lk
SMTP_PASSWORD=<app-password>
APPLICATIONS_EMAIL_TO=cv@emeraldisle.lk,recruitment@emeraldisle.lk
APPLICATIONS_EMAIL_FROM="Emerald Isle Website <no-reply@emeraldisle.lk>"
```

### 2. Staff Dashboard (`dashboard/.env.local`)

Create `dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-publishable-key>
```

> **Note**: Both applications connect to the same Supabase project.

---

## Database Setup & Migrations

All database schemas, RLS policies, and triggers are located in `supabase/migrations/`:

1. `202607310001_initial_content_system.sql` — Core tables (`profiles`, `jobs`, `applications`), RLS security policies, and storage buckets (`job-media`, `candidate-cvs`).
2. `202608010001_popups.sql` — `popups` table and RLS policies for promotional modal popups.
3. `202608040001_hero_slides.sql` — `hero_slides` table and seeds for the homepage carousel.
4. `202608140001_application_vacancy_snapshot.sql` — Trigger and snapshot logic for preserving job titles on applications.

### Initializing Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migration scripts in order in the **Supabase SQL Editor**.
3. Create your first staff user account in **Supabase Authentication > Users**.
4. Promote that user to administrator:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-staff-email@example.com'
);
```

---

## Available Scripts

From the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the public website dev server on port 3000 |
| `npm run dev:dashboard` | Starts the staff dashboard dev server on port 3001 |
| `npm run build` | Builds both the public website and dashboard for production |
| `npm run build:web` | Builds the public website only |
| `npm run build:dashboard` | Builds the dashboard only |
| `npm run lint` | Runs TypeScript checks across the root and dashboard workspaces |
| `npm run test` | Validates production builds |
| `npm run deploy` | Deploys public website and dashboard to Vercel production |

---

## Production Deployment

Recommended architecture:

```text
emeraldislemanpower.com        ──► Public Next.js website (Vercel / Node runtime)
admin.emeraldislemanpower.com  ──► Private staff dashboard (Vercel / Node runtime)
Supabase                       ──► PostgreSQL, Authentication & Secure Storage
SMTP Server                    ──► Email delivery for candidate submissions
```

- **Domain**: `emeraldislemanpower.com` (managed via Hostinger DNS or pointing to Vercel).
- **Public Site**: Fast edge caching, ISR/SSR for job pages, optimized asset delivery.
- **Dashboard**: Secure SSR authentication using `@supabase/ssr` cookies and middleware.

---

## Additional Documentation

- [Design System & Tokens](file:///d:/EIMTS-Website/docs/DESIGN.md)
- [Product Purpose & Brand Guidelines](file:///d:/EIMTS-Website/docs/PRODUCT.md)
- [Project Architecture & Structural Map](file:///d:/EIMTS-Website/docs/PROJECT-STRUCTURE.md)
- [WordPress to Next.js Migration Checklist](file:///d:/EIMTS-Website/docs/MIGRATION-CHECKLIST.md)
- [Comprehensive Project Plan](file:///d:/EIMTS-Website/docs/PROJECT_PLAN.md)

---

## License

Private & proprietary repository for **Emerald Isle Manpower & Travel Services**. All rights reserved.
