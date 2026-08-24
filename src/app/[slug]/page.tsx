import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticlePage from "@/features/blog/BlogArticlePage";
import { articles, getArticleBySlug } from "@/lib/articles";
import { siteName } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/${article.slug}/`;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.keywords,
    authors: [{ name: article.author }],
    category: article.topic,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      siteName,
      title: article.title,
      description: article.excerpt,
      url: canonicalPath,
      publishedTime: article.publishedDate,
      authors: [article.author],
      tags: article.keywords,
      images: [
        {
          url: article.image,
          alt: article.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const sameTopic = articles.filter(
    (candidate) =>
      candidate.slug !== article.slug && candidate.topic === article.topic,
  );
  const otherTopics = articles.filter(
    (candidate) =>
      candidate.slug !== article.slug && candidate.topic !== article.topic,
  );
  const relatedArticles = [...sameTopic, ...otherTopics].slice(0, 3);

  return (
    <BlogArticlePage
      article={article}
      relatedArticles={relatedArticles}
    />
  );
}
