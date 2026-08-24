import type { Metadata } from "next";
import BlogPage from "@/features/blog/BlogPage";
import { blogPath } from "@/lib/articles";
import { siteName } from "@/lib/site";

const title = "Career Advice & Recruitment Insights";
const description =
  "Explore practical career advice, interview tips, leadership guidance and international recruitment insights from Emerald Isle Manpower.";
const blogCover = "/assets/blog-hospitality-career-editorial.webp";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "career advice Sri Lanka",
    "interview tips",
    "overseas employment guidance",
    "international recruitment insights",
    "leadership advice",
  ],
  alternates: { canonical: blogPath },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName,
    title,
    description,
    url: blogPath,
    images: [
      {
        url: blogCover,
        width: 1536,
        height: 960,
        alt: "Career and recruitment insights from Emerald Isle Manpower",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [blogCover],
  },
};

export default function Page() {
  return <BlogPage />;
}
