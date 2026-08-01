import HomePage from "@/features/home/HomePage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Emerald Isle Manpower – Top Recruitment Agency in Sri Lanka",
  "Award-winning recruitment agency in Sri Lanka connecting skilled candidates with trusted foreign employers.",
  "/",
);

export default function Page() {
  return <HomePage />;
}
