import Image from "next/image";
import Link from "next/link";
import { articles } from "@/lib/articles";
import { siteName, siteUrl } from "@/lib/site";

export default function BlogPage() {
  const featured = articles.find(
    (article) => article.slug === "how-recruitment-agencies-simplify-overseas-recruitment",
  ) ?? articles[0];
  const latestArticles = articles.filter((article) => article.slug !== featured.slug);
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Career and recruitment insights from ${siteName}`,
    url: `${siteUrl}/insightful-and-engaging-blog-posts-discover-our-latest-articles/`,
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      datePublished: article.publishedDate,
      url: `${siteUrl}/${article.slug}/`,
      image: `${siteUrl}${article.image}`,
      description: article.excerpt,
      author: {
        "@type": article.author === "Emerald Isle Editorial Team" ? "Organization" : "Person",
        name: article.author,
      },
    })),
  };

  return (
    <main id="main" className="insights-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="insights-hero" aria-labelledby="insights-title">
        <span className="insights-hero-marker" aria-hidden="true">Field notes</span>
        <div className="container insights-hero-grid">
          <div className="insights-hero-copy">
            <p className="eyebrow">Career and recruitment insights</p>
            <h1 id="insights-title">Navigate the world of work with clarity.</h1>
            <p>Practical guidance for candidates, employers and professionals building careers across borders.</p>
          </div>

          <Link className="insights-feature" href={`/${featured.slug}/`} aria-label={`Read ${featured.title}`}>
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <span className="insights-feature-shade" aria-hidden="true" />
            <span className="insights-feature-content">
              <span className="insights-feature-meta">
                <time dateTime={featured.publishedDate}>{featured.displayDate}</time>
                <span aria-hidden="true">/</span>
                <span>{featured.topic}</span>
                <span aria-hidden="true">/</span>
                <span>{featured.readTime}</span>
              </span>
              <h2 className="insights-feature-title">{featured.title}</h2>
              <span className="insights-feature-link">Read the field note <span aria-hidden="true">{"↗"}</span></span>
            </span>
          </Link>
        </div>
      </section>

      <section className="insights-index" aria-labelledby="latest-insights-title">
        <div className="container insights-index-heading">
          <div>
            <p className="eyebrow">Latest thinking</p>
            <h2 id="latest-insights-title">Ideas you can put to work.</h2>
          </div>
          <p>{articles.length} articles on interviews, careers, leadership and international recruitment.</p>
        </div>

        <div className="container insights-grid">
          {latestArticles.map((article) => (
            <article className="insight-card" key={article.slug}>
              <Link
                className="insight-card-link"
                href={`/${article.slug}/`}
                aria-label={`Read more: ${article.title}`}
              >
                <span className="insight-card-image">
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                </span>
                <span className="insight-card-body">
                  <span className="insight-card-meta">
                  <time dateTime={article.publishedDate}>{article.displayDate}</time>
                  <span>{article.topic}</span>
                  <span>{article.readTime}</span>
                  </span>
                  <h2 className="insight-card-title">{article.title}</h2>
                  <span className="insight-card-excerpt">{article.excerpt}</span>
                  <span className="insight-card-read">Read more <span aria-hidden="true">{"↗"}</span></span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
