# Emerald Isle Manpower - Admin Dashboard & Job Management System
## Comprehensive Implementation Plan

**Project Date:** July 28, 2026  
**Status:** Planning Phase  
**Version:** 1.0

---

## 1. PROJECT OVERVIEW

### Current Situation
- Existing WordPress site where graphics team uploads jobs and popups
- New React site built with Vite (deployed on Vercel)
- Jobs currently hardcoded in `JobsPage.tsx`
- Need to migrate to dynamic content management system

### Objective
Create a free admin dashboard where the graphics team can independently manage and publish jobs and popups in real-time without IT involvement.

---

## 2. ARCHITECTURE & TECH STACK

### Frontend Applications
```
apps/
├── site/                    (Main public website - React + Vite)
├── admin/                   (Admin dashboard - React + Vite)
└── shared/                  (Shared utilities and types)
```

### Technology Stack
- **Frontend:** React 19, Vite, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (Images)
- **Authentication:** Supabase Auth (Email/Password)
- **Hosting:** Vercel (separate projects for site & admin)
- **Deployment:** Git + Vercel CI/CD

### Deployment URLs
- **Main Site:** `emerald-isle.lk` (public)
- **Admin Dashboard:** `admin.emerald-isle.lk` (graphics team only)

---

## 3. REQUIREMENTS & SPECIFICATIONS

### 3.1 Content Types to Manage

#### A. Job Listings
**Fields:**
- Job ID (auto-generated)
- Job Title (text)
- Location (dropdown: Ireland, Saudi Arabia, Serbia, Kuwait)
- Category (dropdown: Hospitality, Automotive, Culinary, Engineering, Skilled Trades, Logistics, Retail, Facilities)
- Employment Type (dropdown: Full-time, Part-time, Contract)
- Urgent Flag (boolean - yes/no)
- Job Poster Image (1 image per job, <20MB)
- Image Position (CSS background-position value for cropping)

**Requirements:**
- Graphics team uploads job poster as image
- Fill in job details
- One-click publish
- Appears live immediately on public site
- Can edit/update existing jobs
- Can deactivate jobs (soft delete - not visible to public)
- Only IT can permanently delete jobs

#### B. Popups/Banners
**Fields:**
- Popup ID (auto-generated)
- Popup Image (1 image per popup, <20MB)
- Display Title (optional text)
- Status (Active/Inactive)

**Requirements:**
- Single popup visible at a time (one active at any moment)
- Display in center of screen (floating modal)
- User can close with X button
- If multiple popups exist, rotate them (carousel support)
- Publish immediately when created
- Only IT can delete popups

### 3.2 Storage Specifications

**Images:**
- Free tier: 1 GB storage (Supabase)
- Bandwidth: 3 GB/month (Supabase free tier)
- Expected capacity: 50+ images (more than enough for weekly/daily updates)
- File format: JPG, PNG, WebP
- Max file size: 20 MB per image

**Database:**
- Free tier: Sufficient for current needs
- PostgreSQL via Supabase
- Real-time sync enabled

---

## 4. USER ROLES & WORKFLOW

### Graphics Team
- **Access:** Admin dashboard at `admin.emerald-isle.lk`
- **Authentication:** Email/password login (shared or individual)
- **Permissions:**
  - ✅ Create new jobs
  - ✅ Edit existing jobs
  - ✅ Upload job poster images
  - ✅ Publish jobs immediately
  - ✅ Deactivate jobs
  - ✅ Create and publish popups
  - ✅ Upload popup images
  - ❌ Delete jobs/popups (IT only)
  - ❌ Access code or deployment settings

### IT Team
- **Access:** Main site code repository + admin dashboard (full access)
- **Permissions:**
  - ✅ All admin functions
  - ✅ Permanently delete jobs/popups
  - ✅ Deploy site updates
  - ✅ Manage user accounts
  - ✅ Monitor logs/analytics
  - ✅ Backup data

### Public (Website Visitors)
- **Access:** `emerald-isle.lk`
- **Can:**
  - ✅ View active jobs
  - ✅ Filter jobs by location, category
  - ✅ Search jobs
  - ✅ See active popups
  - ✅ Apply for jobs
  - ❌ Access admin features

---

## 5. DATABASE SCHEMA

### Supabase Tables

#### Table: `jobs`
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  urgent BOOLEAN DEFAULT false,
  image_url VARCHAR(500),
  image_position VARCHAR(50) DEFAULT '50% 50%',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255) -- Graphics team member email
);
```

#### Table: `popups`
```sql
CREATE TABLE popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255) -- Graphics team member email
);
```

#### Table: `job_applications`
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  age INTEGER,
  category VARCHAR(100),
  cv_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. FEATURE BREAKDOWN

### Admin Dashboard Features

#### 6.1 Authentication
- Login page with email/password
- Password reset via email
- Session management
- Auto-logout after inactivity

#### 6.2 Jobs Management
- **List View:**
  - Table with all jobs
  - Columns: Title, Location, Category, Status (Active/Inactive), Posted Date, Actions
  - Search by title
  - Filter by location, category, status
  - Bulk actions (activate/deactivate multiple)

- **Create Job:**
  - Form with all fields
  - Image upload with preview
  - Image position selector (visual cropper)
  - Save as draft or publish immediately
  - Estimated time: 2-3 minutes per job

- **Edit Job:**
  - Update any field
  - Change image
  - Toggle active/inactive status
  - Save changes (immediately reflected on public site)

- **Job Details:**
  - View all metadata
  - See publishing date/time
  - View number of applications received
  - Quick stats

#### 6.3 Popups Management
- **List View:**
  - All popups with thumbnails
  - Active/Inactive status
  - Display order

- **Create Popup:**
  - Image upload with preview
  - Title (optional)
  - Set as active/inactive
  - One-click publish

- **Edit Popup:**
  - Change image or title
  - Toggle active/inactive
  - Reorder display sequence

#### 6.4 Analytics Dashboard (Phase 2)
- Total jobs posted
- Total applications received
- Jobs by location/category
- Popular search terms
- Popup view counts

### Main Site Changes

#### 6.1 Jobs Page Updates
- Fetch jobs from Supabase instead of hardcoded array
- Real-time updates (jobs appear immediately after publish)
- Keep existing filtering/search functionality
- Keep existing UI/UX

#### 6.2 Popup Component
- New component to display active popups
- Show single popup at a time (center screen, floating modal)
- Close button (X)
- Support multiple popups (carousel rotation)
- Auto-hide if no active popups

#### 6.3 Job Application Form
- Update to save applications to Supabase
- Track applications
- Store CV files in Supabase Storage

---

## 7. SECURITY SPECIFICATIONS

### Authentication & Authorization
- ✅ Email/password login via Supabase Auth
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Session tokens with expiration
- ✅ Rate limiting on login attempts (Supabase built-in)
- ✅ Role-based access control (Graphics Team vs IT)

### Data Protection
- ✅ HTTPS for all communications (Vercel)
- ✅ Environment variables for secrets (API keys, URLs)
- ✅ No hardcoded credentials in code
- ✅ Supabase RLS (Row Level Security) for database
- ✅ Audit trail (created_by, timestamps)

### Privacy & SEO
- ✅ Admin dashboard marked as "private" in robots.txt
- ✅ No sitemap entry for `/admin` routes
- ✅ Separate domain for admin (`admin.emerald-isle.lk`)
- ✅ Login required before accessing dashboard

### Backup & Recovery
- ✅ Supabase automatic backups (included in free tier)
- ✅ Database versioning via git
- ✅ Image storage versioning (Supabase)

---

## 8. DEPLOYMENT STRATEGY

### Development Environment
```
Local Machine
├── /apps/site (npm run dev)
├── /apps/admin (npm run dev)
└── Connected to Supabase staging instance
```

### Production Environment

#### Option A: Separate Vercel Projects (Recommended)
```
Main Site Project
├── Repository: Your git repo
├── Branch: main
├── URL: emerald-isle.lk
├── Deployed from: /apps/site
└── Auto-deploy on push to main

Admin Dashboard Project
├── Repository: Same git repo
├── Branch: main (or separate branch)
├── URL: admin.emerald-isle.lk
├── Deployed from: /apps/admin
└── Auto-deploy on push to main
```

#### Option B: Single Vercel Project (Not recommended)
```
Single Project
├── URL: emerald-isle.lk
├── Routes:
│   ├── / → Main site
│   ├── /admin → Admin dashboard (harder to secure)
└── Deployment: Both apps in one project
```

### Environment Variables (Both Apps)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_SUPABASE_SERVICE_KEY=xxxxx (only in admin)
```

### CI/CD Pipeline
- Git push → Vercel detects → Auto-builds → Auto-deploys
- Failed builds = no deployment
- Easy rollback to previous version

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Set up Supabase project (free tier)
- [ ] Create database tables (jobs, popups, applications)
- [ ] Set up Supabase Storage buckets (images)
- [ ] Configure authentication
- [ ] Set up environment variables

### Phase 2: Admin Dashboard (Week 2)
- [ ] Create admin app folder structure
- [ ] Build login page
- [ ] Build jobs management (CRUD operations)
- [ ] Build popups management (CRUD operations)
- [ ] Add image upload functionality
- [ ] Test all operations
- [ ] Deploy to `admin.emerald-isle.lk`

### Phase 3: Main Site Integration (Week 3)
- [ ] Update JobsPage to fetch from Supabase
- [ ] Create Popup component
- [ ] Integrate popups into main layout
- [ ] Update job applications to save to Supabase
- [ ] Test real-time updates
- [ ] Deploy to `emerald-isle.lk`

### Phase 4: Testing & Polish (Week 4)
- [ ] End-to-end testing
- [ ] Graphics team UAT (user acceptance testing)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

### Phase 5: Go Live & Handover (Week 5)
- [ ] Migrate existing jobs to Supabase
- [ ] Final testing on production URLs
- [ ] Training for graphics team
- [ ] Monitor for issues
- [ ] Decommission old WordPress (if needed)

---

## 10. CURRENT STATE REFERENCE

### Existing Jobs in JobsPage.tsx
Currently 12 jobs are hardcoded in the component:
- Barista Positions in Saudi Arabia (Urgent)
- Assistant General Manager (Hotel) - Ireland
- Automotive Job Opportunities - Saudi Arabia (Urgent)
- Carpentry and Industrial Jobs - Serbia
- Warehouse Associates - Serbia (Urgent)
- Culinary Professionals - Ireland
- Culinary Job Opportunities - Kuwait (Urgent)
- Executive Chef Vacancy - Kuwait
- Grill Cooks and Pizza Makers - Kuwait (Urgent)
- Aluminium Fabricators - Serbia
- Merchandiser Positions - Kuwait
- CAFM Coordinator and Storekeeper - Saudi Arabia (Urgent)

**Migration:** These will be imported into Supabase during implementation.

---

## 11. FILE STRUCTURE

```
EIMTS/
├── apps/
│   ├── site/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── jobs/
│   │   │   │   │   └── JobsPage.tsx (updated)
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── admin/
│       ├── src/
│       │   ├── components/
│       │   │   ├── JobForm.tsx
│       │   │   ├── JobsList.tsx
│       │   │   ├── PopupForm.tsx
│       │   │   ├── PopupsList.tsx
│       │   │   └── ...
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── JobsPage.tsx
│       │   │   ├── PopupsPage.tsx
│       │   │   └── ...
│       │   ├── services/
│       │   │   ├── supabase.ts
│       │   │   ├── auth.ts
│       │   │   └── ...
│       │   └── App.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── shared/
│       ├── types.ts
│       ├── supabase-client.ts
│       └── constants.ts
│
├── package.json (root)
└── PROJECT_PLAN.md (this file)
```

---

## 12. COST BREAKDOWN

| Item | Cost | Notes |
|------|------|-------|
| Supabase (Database + Storage) | **FREE** | 1GB storage, 3GB bandwidth/month |
| Vercel (Hosting) | **FREE** | Two free projects allowed |
| Hostinger MySQL | Already owned | Can keep for other purposes |
| Custom domain | Already owned | `emerald-isle.lk` |
| **Total Monthly Cost** | **$0** | Fully free tier! |

---

## 13. SUCCESS CRITERIA

### Functional Requirements Met
- ✅ Graphics team can login to admin dashboard
- ✅ Graphics team can upload and publish jobs in <5 minutes
- ✅ Jobs appear live on public site immediately
- ✅ Graphics team can manage popups
- ✅ Popups display correctly on site
- ✅ Job applications save to database

### Non-Functional Requirements Met
- ✅ Admin dashboard loads in <3 seconds
- ✅ Image upload completes in <30 seconds (for 20MB files)
- ✅ Real-time sync (changes visible within 5 seconds)
- ✅ 99.9% uptime (Vercel SLA)
- ✅ Secure authentication (no unauthorized access)
- ✅ No conflicts between teams' work

### Team Satisfaction
- ✅ Graphics team finds dashboard intuitive (no training needed)
- ✅ IT team has full control when needed
- ✅ Job posting takes <5 minutes
- ✅ No need to contact IT for job updates

---

## 14. MAINTENANCE & SUPPORT

### Regular Tasks (Graphics Team)
- Post new jobs when recruitment needs arise
- Update job details if requirements change
- Create/update popups as needed
- Monitor job application count

### Regular Tasks (IT Team)
- Monitor system performance
- Handle database backups (automatic via Supabase)
- Deploy site updates
- Manage user access if needed
- Track analytics

### Troubleshooting
- Failed image upload → Check file size, format
- Slow job posting → Check internet connection
- Jobs not appearing → Check browser cache, refresh
- Contact IT if issues persist

---

## 15. KNOWN CONSTRAINTS & CONSIDERATIONS

1. **Shared Login:** All graphics team members use same credentials (no individual tracking)
   - Solution: Can upgrade to individual logins later if needed

2. **Image Hosting:** Images stored in Supabase (not Hostinger MySQL)
   - Reasoning: Better performance, CDN included, no database bloat

3. **Approval Workflow:** Jobs go live immediately
   - No draft/approval stage (can add later if needed)

4. **Popup Rotation:** Only 1 active popup at a time
   - Rotates between available popups automatically

5. **Admin Dashboard:** Separate from main site
   - Graphics team never touches code or git

---

## 16. FUTURE ENHANCEMENTS (Phase 2+)

- Analytics dashboard (views, applications per job)
- Email notifications (new applications)
- Job scheduling (publish at specific date/time)
- Individual user accounts (instead of shared login)
- Approval workflow (draft → IT approves → publish)
- Job expiration (auto-disable after X days)
- Bulk job import (CSV upload)
- Job templates
- Custom job fields
- Popup analytics

---

## 17. QUESTIONS FOR CLARIFICATION

Before implementation, confirm:

1. ✅ **Shared login** for graphics team? (Yes)
2. ✅ **Single popup** at a time? (Yes)
3. ✅ **Floating center** display for popups? (Yes)
4. ✅ **Immediate publish** without approval? (Yes)
5. ✅ **Images in Supabase**? (Yes)
6. ✅ **Separate URLs** for site and admin? (Recommended)

---

## 18. DOCUMENT METADATA

**Prepared For:** Graphics Team + IT Team  
**Use Case:** Admin Dashboard Development  
**Version:** 1.0  
**Last Updated:** July 28, 2026  
**Next Review:** After Phase 1 completion  

---

**END OF DOCUMENT**