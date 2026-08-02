import JobsPage from "@/features/jobs/JobsPage";
import { PromoPopup } from "@/components/ui/PromoPopup";
import { getPublishedJobs } from "@/lib/jobs";
import { getActivePopup } from "@/lib/popups";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Foreign Job Vacancies for Sri Lankans",
  "Explore current foreign job vacancies in hospitality, automotive, construction, logistics and culinary sectors.",
  "/foreign-job-vacancies",
);

// Always fetch fresh data so newly published jobs and popups appear
// immediately on the live website.
export const dynamic = "force-dynamic";

export default async function Page() {
  const [jobs, popup] = await Promise.all([
    getPublishedJobs(),
    getActivePopup(),
  ]);
  // A staff-authored popup wins; otherwise urgent vacancies announce themselves.
  const urgentJobs = jobs
    .filter((job) => job.urgent)
    .slice(0, 5)
    .map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      location: job.location,
      category: job.category,
      image: job.image,
    }));
  return (
    <>
      <JobsPage initialJobs={jobs} />
      <PromoPopup popup={popup} urgentJobs={urgentJobs} />
    </>
  );
}
