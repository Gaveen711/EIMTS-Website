import JobsPage from "@/features/jobs/JobsPage";
import { getPublishedJobs } from "@/lib/jobs";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Foreign Job Vacancies for Sri Lankans",
  "Explore current foreign job vacancies in hospitality, automotive, construction, logistics and culinary sectors.",
  "/foreign-job-vacancies",
);

export const revalidate = 300;

export default async function Page() {
  const jobs = await getPublishedJobs();
  return <JobsPage initialJobs={jobs} />;
}
