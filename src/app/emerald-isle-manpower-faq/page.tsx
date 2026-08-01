import FaqPage from "@/features/faq/FaqPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Emerald Isle Manpower FAQ",
  "Answers about candidate accounts, passwords, CV uploads, profiles and foreign job applications.",
  "/emerald-isle-manpower-faq",
);

export default function Page() {
  return <FaqPage />;
}
