import { createClient } from "@supabase/supabase-js";
import type { Job } from "@/features/jobs/JobsPage";

export type PublicJobDetail = {
  id: string;
  slug: string;
  title: string;
  country: string;
  location: string | null;
  category: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  summary: string;
  description: string;
  requirements: string[];
  image_url: string | null;
  urgent: boolean;
  published_at: string | null;
  expires_at: string | null;
};

type PublishedJobRow = {
  id: string;
  slug: string;
  title: string;
  country: string;
  location: string | null;
  category: string;
  employment_type: string;
  urgent: boolean;
  image_url: string | null;
  image_position: string | null;
};

export async function getPublishedJobs(): Promise<Job[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return [];

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id,slug,title,country,location,category,employment_type,urgent,image_url,image_position",
    )
    .eq("status", "published")
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
    .order("urgent", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Could not load published jobs", error?.message);
    return [];
  }

  return (data as PublishedJobRow[]).map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    location: job.location || job.country,
    category: job.category,
    employmentType: job.employment_type,
    urgent: job.urgent,
    image: job.image_url || "/assets/blog-global-careers.webp",
    imagePosition: job.image_position || "50% 50%",
  }));
}

export async function getPublishedJobBySlug(
  slug: string,
): Promise<PublicJobDetail | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id,slug,title,country,location,category,employment_type,salary_min,salary_max,currency,summary,description,requirements,image_url,urgent,published_at,expires_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicJobDetail;
}

export async function getPublishedJobSlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return [];

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("jobs")
    .select("slug,updated_at")
    .eq("status", "published");

  if (error || !data) return [];
  return data as Array<{ slug: string; updated_at: string }>;
}
