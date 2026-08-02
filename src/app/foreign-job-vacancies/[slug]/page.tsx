import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { getPublishedJobBySlug } from "@/lib/jobs";
import { pageMetadata, siteName, siteUrl } from "@/lib/site";
import styles from "./job-detail.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
) {
  if (!min && !max) return null;
  const amount = new Intl.NumberFormat("en-GB");
  if (min && max && max !== min)
    return `${currency} ${amount.format(min)} – ${amount.format(max)}`;
  return `${currency} ${amount.format(min || max || 0)}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    return {
      title: "Vacancy not found",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata(
    job.title,
    job.summary,
    `/foreign-job-vacancies/${job.slug}`,
  );
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-12a6 6 0 1 0-12 0c0 6.9 6 12 6 12Z" /><circle cx="12" cy="9" r="2" /></svg>;
}
function SalaryIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="12" rx="2" /><circle cx="12" cy="13" r="2.6" /><path d="M6 7V5h12v2" /></svg>;
}
function HourglassIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 7 8 7 8 11s-8 4-8 7M16 3c0 7-8 7-8 11s8 4 8 7" /></svg>;
}
function BriefcaseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></svg>;
}
function TagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 12 9-9 9 3-3 9-9 9z" opacity="0" /><path d="M20 12.5 12.5 20a2 2 0 0 1-2.8 0L4 14.3V4h10.3l5.7 5.7a2 2 0 0 1 0 2.8Z" /><circle cx="9" cy="9" r="1.6" /></svg>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) notFound();

  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);

  const overview = [
    job.published_at && {
      icon: <CalendarIcon />,
      label: "Date Posted",
      value: dateFormat.format(new Date(job.published_at)),
    },
    {
      icon: <PinIcon />,
      label: "Location",
      value: job.location || job.country,
    },
    salary && {
      icon: <SalaryIcon />,
      label: "Offered Salary",
      value: salary,
    },
    job.expires_at && {
      icon: <HourglassIcon />,
      label: "Expiration date",
      value: dateFormat.format(new Date(job.expires_at)),
    },
    {
      icon: <BriefcaseIcon />,
      label: "Employment Type",
      value: job.employment_type,
    },
    {
      icon: <TagIcon />,
      label: "Category",
      value: job.category,
    },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label: string; value: string }>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.published_at,
    validThrough: job.expires_at,
    employmentType: job.employment_type.toUpperCase().replace(/[- ]/g, "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: siteName,
      sameAs: siteUrl,
      logo: `${siteUrl}/assets/emerald-isle-logo.webp`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || job.country,
        addressCountry: job.country,
      },
    },
    ...(job.salary_min
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.currency,
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min,
              maxValue: job.salary_max || job.salary_min,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <main id="main" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        className={styles.hero}
        style={
          job.image_url
            ? { backgroundImage: `url(${job.image_url})` }
            : undefined
        }
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <a href="/foreign-job-vacancies/">← All vacancies</a>
          <div className={styles.badges}>
            <span>{job.category}</span>
            <span>{job.country}</span>
            {job.urgent && <strong>Urgent</strong>}
          </div>
          <h1>{job.title}</h1>
          <p>{job.summary}</p>
          {salary && <div className={styles.salaryBanner}>{salary}</div>}
          <a className={styles.applyNow} href="#apply">
            Apply Now
          </a>
        </div>
      </section>

      <section className={styles.overviewWrap} aria-label="Job overview">
        <div className={styles.overviewCard}>
          <h2>Job Overview</h2>
          <div className={styles.overviewGrid}>
            {overview.map((item) => (
              <div key={item.label} className={styles.overviewItem}>
                <i>{item.icon}</i>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <article>
          <h2>Job Description</h2>
          {job.description
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {job.requirements.length > 0 && (
            <>
              <h2>What you will need</h2>
              <ul>
                {job.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </>
          )}
        </article>
        <aside id="apply">
          <h2>Interested in this role?</h2>
          <p>Register your details and upload an up-to-date CV for review.</p>
          <JobApplicationForm jobId={job.id} jobTitle={job.title} />
          <small>
            Emerald Isle never guarantees placement or requests unofficial
            payments through this website.
          </small>
        </aside>
      </div>
    </main>
  );
}
