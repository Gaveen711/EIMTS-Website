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
  return (
    <>
      <JobsPage initialJobs={jobs} />
      <PromoPopup popup={popup} />
    </>
  );
}
