import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Article } from "@/lib/articles";
import { blogPath } from "@/lib/articles";
import { siteName, siteUrl } from "@/lib/site";

type BlogArticlePageProps = {
  article: Article;
  relatedArticles: Article[];
};

const shell: CSSProperties = {
  width: "min(1120px, calc(100% - 32px))",
  marginInline: "auto",
};

const arrowIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    width="17"
    height="17"
    fill="none"
  >
    <path
      d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BlogArticlePage({
  article,
  relatedArticles,
}: BlogArticlePageProps) {
  const canonicalUrl = `${siteUrl}/${article.slug}/`;
  const imageUrl = `${siteUrl}${article.image}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
    },
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    author: {
      "@type": article.author === "Emerald Isle Editorial Team" ? "Organization" : "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/emerald-isle-logo.webp`,
      },
    },
    articleSection: article.topic,
    keywords: article.keywords.join(", "),
    inLanguage: "en-GB",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: `${siteUrl}${blogPath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main
      id="main"
      className="ei-article-page"
      style={{ background: "var(--ei-neutral, #f4f5f0)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="ei-article">
        <header
          className="ei-article-hero"
          style={{
            padding: "clamp(134px, 14vw, 190px) 0 clamp(58px, 8vw, 96px)",
            color: "#fff",
            background:
              "radial-gradient(circle at 82% 8%, rgba(243, 184, 75, .2), transparent 30%), var(--ei-deep, #03271f)",
          }}
        >
          <div className="ei-article-shell" style={shell}>
            <nav
              className="ei-article-breadcrumb"
              aria-label="Breadcrumb"
              style={{ marginBottom: "38px" }}
            >
              <ol
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  color: "#bfd2ca",
                  fontSize: "14px",
                }}
              >
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={blogPath}>Insights</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" style={{ color: "#fff" }}>
                  {article.title}
                </li>
              </ol>
            </nav>

            <div
              className="ei-article-hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
                alignItems: "end",
                gap: "clamp(34px, 6vw, 82px)",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 20px",
                    color: "var(--ei-amber, #f3b84b)",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: ".11em",
                    textTransform: "uppercase",
                  }}
                >
                  {article.topic}
                </p>
                <h1
                  style={{
                    maxWidth: "820px",
                    margin: 0,
                    color: "#fff",
                    fontSize: "clamp(2.8rem, 6.4vw, 5.7rem)",
                    lineHeight: ".98",
                    letterSpacing: "-.045em",
                    textWrap: "balance",
                  }}
                >
                  {article.title}
                </h1>
                <p
                  style={{
                    maxWidth: "670px",
                    margin: "26px 0 0",
                    color: "#d3e0db",
                    fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
                    lineHeight: 1.65,
                  }}
                >
                  {article.excerpt}
                </p>
              </div>

              <dl
                className="ei-article-meta"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 135px), 1fr))",
                  gap: "18px",
                  margin: 0,
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(255, 255, 255, .22)",
                }}
              >
                <div>
                  <dt style={{ color: "#9fb6ad", fontSize: "12px" }}>
                    Published
                  </dt>
                  <dd style={{ margin: "5px 0 0", fontWeight: 700 }}>
                    <time dateTime={article.publishedDate}>
                      {article.displayDate}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "#9fb6ad", fontSize: "12px" }}>
                    Reading time
                  </dt>
                  <dd style={{ margin: "5px 0 0", fontWeight: 700 }}>
                    {article.readTime}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <div
          className="ei-article-cover-wrap"
          style={{ ...shell, padding: "clamp(32px, 5vw, 58px) 0 0" }}
        >
          <figure
            className="ei-article-cover"
            style={{
              position: "relative",
              minHeight: "clamp(260px, 52vw, 620px)",
              margin: 0,
              overflow: "hidden",
              background: "#dbe4df",
              boxShadow: "0 30px 80px rgba(3, 39, 31, .14)",
            }}
          >
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              priority
              sizes="(max-width: 1152px) calc(100vw - 32px), 1120px"
              style={{ objectFit: "cover" }}
            />
          </figure>
        </div>

        <div
          className="ei-article-body"
          style={{
            width: "min(780px, calc(100% - 32px))",
            marginInline: "auto",
            padding: "clamp(64px, 9vw, 112px) 0 clamp(74px, 10vw, 126px)",
          }}
        >
          <p
            className="ei-article-introduction"
            style={{
              margin: "0 0 clamp(48px, 7vw, 72px)",
              color: "var(--ei-ink, #10221a)",
              fontSize: "clamp(1.25rem, 2.6vw, 1.65rem)",
              lineHeight: 1.55,
              letterSpacing: "-.012em",
            }}
          >
            {article.introduction}
          </p>

          {article.sections.map((section) => (
            <section
              className="ei-article-section"
              key={section.heading}
              style={{
                marginTop: "clamp(44px, 7vw, 68px)",
                paddingTop: "clamp(32px, 5vw, 46px)",
                borderTop: "1px solid #cbd6d0",
              }}
            >
              <h2
                style={{
                  maxWidth: "680px",
                  margin: "0 0 22px",
                  color: "var(--ei-ink, #10221a)",
                  fontSize: "clamp(1.85rem, 4vw, 3rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-.035em",
                  textWrap: "balance",
                }}
              >
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    margin: "0 0 20px",
                    color: "var(--ei-muted, #52635c)",
                    fontSize: "clamp(1rem, 1.8vw, 1.12rem)",
                    lineHeight: 1.82,
                  }}
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul
                  style={{
                    display: "grid",
                    gap: "13px",
                    margin: "28px 0 0",
                    padding: "0 0 0 22px",
                    color: "var(--ei-ink, #10221a)",
                    fontSize: "clamp(1rem, 1.8vw, 1.1rem)",
                    lineHeight: 1.65,
                  }}
                >
                  {section.bullets.map((item) => (
                    <li key={item} style={{ paddingLeft: "7px" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <footer
            className="ei-article-author"
            style={{
              marginTop: "clamp(58px, 8vw, 84px)",
              padding: "28px 0",
              borderTop: "1px solid #cbd6d0",
              borderBottom: "1px solid #cbd6d0",
              color: "var(--ei-muted, #52635c)",
              fontSize: "14px",
            }}
          >
            Written by <strong style={{ color: "var(--ei-ink, #10221a)" }}>{article.author}</strong>
          </footer>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <aside
          className="ei-article-related"
          aria-labelledby="related-articles-title"
          style={{
            padding: "clamp(72px, 9vw, 108px) 0",
            background: "#fff",
          }}
        >
          <div className="ei-article-shell" style={shell}>
            <div
              className="ei-article-related-head"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "end",
                justifyContent: "space-between",
                gap: "22px",
                marginBottom: "42px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 10px",
                    color: "#08795d",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                  }}
                >
                  Continue reading
                </p>
                <h2
                  id="related-articles-title"
                  style={{
                    margin: 0,
                    fontSize: "clamp(2.2rem, 5vw, 4.4rem)",
                    lineHeight: 1,
                    letterSpacing: "-.04em",
                  }}
                >
                  Related insights
                </h2>
              </div>
              <Link
                href={blogPath}
                style={{ color: "#08795d", fontWeight: 700 }}
              >
                View all articles
              </Link>
            </div>

            <div
              className="ei-article-related-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "clamp(24px, 4vw, 42px)",
              }}
            >
              {relatedArticles.map((related) => (
                <article className="ei-article-related-card" key={related.slug}>
                  <Link
                    className="ei-article-related-image"
                    href={`/${related.slug}/`}
                    aria-label={`Read ${related.title}`}
                    style={{
                      position: "relative",
                      display: "block",
                      aspectRatio: "16 / 10",
                      overflow: "hidden",
                      background: "#dbe4df",
                    }}
                  >
                    <Image
                      src={related.image}
                      alt=""
                      fill
                      sizes="(max-width: 620px) calc(100vw - 32px), (max-width: 1152px) 33vw, 350px"
                      style={{ objectFit: "cover" }}
                    />
                  </Link>
                  <p
                    style={{
                      margin: "20px 0 10px",
                      color: "#08795d",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: ".09em",
                      textTransform: "uppercase",
                    }}
                  >
                    {related.topic} · {related.readTime}
                  </p>
                  <h3
                    style={{
                      margin: 0,
                      color: "var(--ei-ink, #10221a)",
                      fontSize: "clamp(1.35rem, 2.7vw, 1.75rem)",
                      lineHeight: 1.18,
                      letterSpacing: "-.025em",
                    }}
                  >
                    <Link href={`/${related.slug}/`}>{related.title}</Link>
                  </h3>
                  <Link
                    href={`/${related.slug}/`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "17px",
                      color: "#08795d",
                      fontWeight: 700,
                    }}
                  >
                    Read article {arrowIcon}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
