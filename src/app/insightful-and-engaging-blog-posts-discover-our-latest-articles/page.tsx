import BlogPage from "@/features/blog/BlogPage";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Career & Recruitment Insights",
  "Practical career, interview, leadership and international recruitment insights from Emerald Isle Manpower.",
  "/insightful-and-engaging-blog-posts-discover-our-latest-articles",
);

export default function Page() {
  return <BlogPage />;
}
