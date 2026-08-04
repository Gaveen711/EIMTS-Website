import { createClient } from "@supabase/supabase-js";

export type HeroSlide = {
  image: string;
  kicker: string;
  title: string;
  copy: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  cta2Label: string | null;
  cta2Url: string | null;
};

export type HeroContent = {
  slides: HeroSlide[];
  takeover: boolean;
};

type HeroSlideRow = {
  kicker: string | null;
  title: string;
  copy: string;
  image_url: string;
  cta_label: string | null;
  cta_url: string | null;
  cta2_label: string | null;
  cta2_url: string | null;
  is_takeover: boolean;
  updated_at: string;
};

// Shown whenever Supabase is unreachable or has no live slides, so the
// homepage hero can never render empty.
const fallbackSlides: HeroSlide[] = [
  {
    image: "/assets/emerald-journey-hero.webp",
    kicker: "Trusted in Sri Lanka since 1995",
    title: "32+ years of connecting Sri Lankan talent with global opportunity.",
    copy: "Responsible overseas recruitment, documentation and travel guidance, supported by one accountable team.",
    ctaLabel: "Explore foreign jobs",
    ctaUrl: "/foreign-job-vacancies/",
    cta2Label: "Hire exceptional talent",
    cta2Url: "/client-recruitment-solutions/",
  },
  {
    image: "/assets/hero-employer-partnership.webp",
    kicker: "Trusted recruitment. Stronger teams.",
    title: "Exceptional people build stronger businesses.",
    copy: "Industry-focused recruitment connecting respected employers with carefully screened talent.",
    ctaLabel: "Explore foreign jobs",
    ctaUrl: "/foreign-job-vacancies/",
    cta2Label: "Hire exceptional talent",
    cta2Url: "/client-recruitment-solutions/",
  },
  {
    image: "/assets/hero-travel-guidance.webp",
    kicker: "From application to arrival.",
    title: "Every overseas journey deserves clear guidance.",
    copy: "Recruitment, documentation and travel support brought together by one accountable team.",
    ctaLabel: "Explore foreign jobs",
    ctaUrl: "/foreign-job-vacancies/",
    cta2Label: "Hire exceptional talent",
    cta2Url: "/client-recruitment-solutions/",
  },
];

const fallbackContent: HeroContent = { slides: fallbackSlides, takeover: false };

function toSlide(row: HeroSlideRow): HeroSlide {
  return {
    image: row.image_url,
    kicker: row.kicker || "",
    title: row.title,
    copy: row.copy,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    cta2Label: row.cta2_label,
    cta2Url: row.cta2_url,
  };
}

export async function getHeroContent(): Promise<HeroContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return fallbackContent;

  try {
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false },
    });

    // Row-level security already hides inactive and out-of-window slides from
    // anonymous readers, so every row we get back is currently visible.
    const { data, error } = await supabase
      .from("hero_slides")
      .select(
        "kicker,title,copy,image_url,cta_label,cta_url,cta2_label,cta2_url,is_takeover,updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return fallbackContent;
    const rows = data as HeroSlideRow[];

    // A live occasion post (anniversary, Vesak…) takes over the whole hero;
    // the most recently updated one wins if several overlap.
    const takeovers = rows
      .filter((row) => row.is_takeover)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    if (takeovers.length > 0) {
      return { slides: [toSlide(takeovers[0])], takeover: true };
    }

    const regular = rows.filter((row) => !row.is_takeover).map(toSlide);
    return regular.length > 0
      ? { slides: regular, takeover: false }
      : fallbackContent;
  } catch {
    return fallbackContent;
  }
}
