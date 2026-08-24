import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import { getPublishedJobSlugs } from "@/lib/jobs";
import { siteUrl } from "@/lib/site";

const routes = [
  "",
  "/about-us-emerald-isle-manpower",
  "/contact",
  "/foreign-job-vacancies",
  "/client-recruitment-solutions",
  "/projects",
  "/insightful-and-engaging-blog-posts-discover-our-latest-articles",
  "/emerald-isle-manpower-faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getPublishedJobSlugs();
  const staticRoutes = routes.map((route, index) => ({
    url: `${siteUrl}${route}/`,
    lastModified: new Date(),
    changeFrequency: (index === 0 ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: index === 0 ? 1 : route === "/foreign-job-vacancies" ? 0.9 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...articles.map((article) => ({
      url: `${siteUrl}/${article.slug}/`,
      lastModified: new Date(article.publishedDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...jobs.map((job) => ({
      url: `${siteUrl}/foreign-job-vacancies/${job.slug}/`,
      lastModified: new Date(job.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
