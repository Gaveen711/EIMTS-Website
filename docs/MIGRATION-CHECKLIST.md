# WordPress to Next.js Migration Checklist

## Before launch

- Export every indexed WordPress URL from Search Console and the current sitemap.
- Map each old URL to the same Next.js URL or a permanent redirect.
- Preserve page titles, descriptions, headings and important page copy.
- Import current jobs with stable, unique slugs.
- Verify canonical URLs, robots rules and the generated sitemap.
- Validate `JobPosting`, `Organization`, `BreadcrumbList` and FAQ structured data.
- Test forms, email delivery, dashboard roles and job expiry.
- Compare Core Web Vitals on mobile and desktop.
- Crawl the staging site and resolve broken internal links.

## Launch

- Keep the old WordPress files and database backed up.
- Switch the main domain only after redirects pass.
- Submit `/sitemap.xml` in Google Search Console.
- Inspect the homepage, jobs index and several job detail URLs.

## First 30 days

- Monitor indexed pages, crawl errors, rankings and traffic.
- Fix redirect gaps immediately.
- Keep expired job pages useful: show that the vacancy closed and link to current
  opportunities before eventually returning `410 Gone` when appropriate.
- Do not delete the WordPress backup until the new system is stable.
