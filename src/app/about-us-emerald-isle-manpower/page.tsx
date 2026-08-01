import AboutPage from "@/features/about/AboutPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "About Emerald Isle Manpower & Travel Services",
  "Discover Emerald Isle Manpower's mission, values, licensed recruitment expertise and international network.",
  "/about-us-emerald-isle-manpower",
);

export default function Page() {
  return <AboutPage />;
}
