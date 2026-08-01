import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { getPublishedJobBySlug } from "@/lib/jobs";
import { pageMetadata, siteName, siteUrl } from "@/lib/site";
import styles from "./job-detail.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

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

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) notFound();

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
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <a href="/foreign-job-vacancies/">← All vacancies</a>
          <div className={styles.badges}>
            <span>{job.category}</span>
            {job.urgent && <strong>Urgent</strong>}
          </div>
          <h1>{job.title}</h1>
          <p>{job.summary}</p>
          <div className={styles.meta}>
            <span>{job.location || job.country}</span>
            <span>{job.employment_type}</span>
            {job.expires_at && (
              <span>
                Apply by{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(job.expires_at))}
              </span>
            )}
          </div>
        </div>
      </section>
      <div className={styles.content}>
        <article>
          <h2>About this opportunity</h2>
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
        <aside>
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
