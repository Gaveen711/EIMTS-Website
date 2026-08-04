import HomePage from "@/features/home/HomePage";
import { getHeroContent } from "@/lib/hero";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Emerald Isle Manpower – Top Recruitment Agency in Sri Lanka",
  "Award-winning recruitment agency in Sri Lanka connecting skilled candidates with trusted foreign employers.",
  "/",
);

// Hero slides are managed from the dashboard; pick up changes within a minute
// while keeping the homepage statically cached.
export const revalidate = 60;

export default async function Page() {
  const hero = await getHeroContent();
  return <HomePage hero={hero} />;
}
