import EmployerPage from "@/features/employers/EmployerPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "International Recruitment Solutions for Employers",
  "End-to-end international recruitment solutions for employers across hospitality, engineering, construction and more.",
  "/client-recruitment-solutions",
);

export default function Page() {
  return <EmployerPage />;
}
