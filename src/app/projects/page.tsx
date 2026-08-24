import ProjectsPage from "@/features/projects/ProjectsPage";
import { getPublishedProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Recruitment Projects",
  "Explore responsible workforce mobilisation, skilled recruitment and deployment projects delivered by Emerald Isle Manpower.",
  "/projects",
);

export const revalidate = 60;

export default async function Page() {
  const projects = await getPublishedProjects();
  return <ProjectsPage projects={projects} />;
}
