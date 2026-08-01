import ProjectsPage from "@/features/projects/ProjectsPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Recruitment Projects",
  "Explore responsible workforce mobilisation, skilled recruitment and deployment projects delivered by Emerald Isle Manpower.",
  "/projects",
);

export default function Page() {
  return <ProjectsPage />;
}
