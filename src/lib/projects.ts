import { createClient } from "@supabase/supabase-js";
import { siteUrl } from "./site";

export type PublicProjectImage = {
  id: string;
  src: string;
  alt: string;
};

export type PublicProject = {
  id: string;
  name: string;
  country: string;
  client: string;
  hero: { src: string; position: string };
  images: PublicProjectImage[];
};

type ProjectImageRow = {
  id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string;
};

type ProjectRow = {
  slug: string;
  name: string;
  country: string;
  client: string;
  images: ProjectImageRow[];
  hero_image_id: string;
  hero_position_x: number;
  hero_position_y: number;
};

const fallbackProjects: PublicProject[] = [
  {
    id: "al-mahmal",
    name: "Saudi Arabia Al Mahmal",
    country: "Saudi Arabia",
    client: "Al Mahmal",
    hero: {
      src: "/assets/projects/saudi-al-mahmal/training.webp",
      position: "30% 45%",
    },
    images: [
      {
        id: "al-mahmal-training",
        src: "/assets/projects/saudi-al-mahmal/training.webp",
        alt: "Saudi Arabia Al Mahmal workforce training",
      },
      {
        id: "al-mahmal-interview",
        src: "/assets/projects/saudi-al-mahmal/interview.webp",
        alt: "Saudi Arabia Al Mahmal project interview",
      },
    ],
  },
  {
    id: "mcdonalds-kuwait",
    name: "McDonalds Kuwait",
    country: "Kuwait",
    client: "McDonalds",
    hero: {
      src: "/assets/projects/mcdonalds-kuwait/interview.webp",
      position: "42% 40%",
    },
    images: [
      { id: "mcdonalds-interview", src: "/assets/projects/mcdonalds-kuwait/interview.webp", alt: "McDonalds Kuwait candidate interview" },
      { id: "mcdonalds-briefing-1", src: "/assets/projects/mcdonalds-kuwait/briefing-1.webp", alt: "McDonalds Kuwait candidate briefing" },
      { id: "mcdonalds-team-1", src: "/assets/projects/mcdonalds-kuwait/team-1.webp", alt: "McDonalds Kuwait project team" },
      { id: "mcdonalds-team-2", src: "/assets/projects/mcdonalds-kuwait/team-2.webp", alt: "McDonalds Kuwait recruitment team" },
      { id: "mcdonalds-team-3", src: "/assets/projects/mcdonalds-kuwait/team-3.webp", alt: "McDonalds Kuwait project group" },
      { id: "mcdonalds-team-4", src: "/assets/projects/mcdonalds-kuwait/team-4.webp", alt: "McDonalds Kuwait project participants" },
      { id: "mcdonalds-briefing-2", src: "/assets/projects/mcdonalds-kuwait/briefing-2.webp", alt: "McDonalds Kuwait group briefing" },
    ],
  },
  {
    id: "qatar-compass",
    name: "Qatar Compass",
    country: "Qatar",
    client: "Qatar Compass",
    hero: {
      src: "/assets/projects/qatar-compass/briefing.webp",
      position: "28% 45%",
    },
    images: [
      { id: "qatar-arrival", src: "/assets/projects/qatar-compass/arrival.webp", alt: "Qatar Compass workforce arrival" },
      { id: "qatar-briefing", src: "/assets/projects/qatar-compass/briefing.webp", alt: "Qatar Compass project briefing" },
      { id: "qatar-team-1", src: "/assets/projects/qatar-compass/team-1.webp", alt: "Qatar Compass project team" },
      { id: "qatar-team-2", src: "/assets/projects/qatar-compass/team-2.webp", alt: "Qatar Compass project group" },
      { id: "qatar-team-3", src: "/assets/projects/qatar-compass/team-3.webp", alt: "Qatar Compass candidates" },
      { id: "qatar-team-4", src: "/assets/projects/qatar-compass/team-4.webp", alt: "Qatar Compass project participants" },
    ],
  },
  {
    id: "uae-almasaood",
    name: "UAE AL Masaood",
    country: "United Arab Emirates",
    client: "AL Masaood",
    hero: {
      src: "/assets/projects/uae-almasaood/site.webp",
      position: "72% 40%",
    },
    images: [
      { id: "almasaood-briefing", src: "/assets/projects/uae-almasaood/briefing.webp", alt: "UAE AL Masaood project briefing" },
      { id: "almasaood-workshop", src: "/assets/projects/uae-almasaood/workshop.webp", alt: "UAE AL Masaood workplace workshop" },
      { id: "almasaood-inspection", src: "/assets/projects/uae-almasaood/inspection.webp", alt: "UAE AL Masaood vehicle inspection" },
      { id: "almasaood-site", src: "/assets/projects/uae-almasaood/site.webp", alt: "UAE AL Masaood project site visit" },
    ],
  },
];

function publicImageSource(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    if (
      url.origin === siteUrl &&
      /^\/assets\/projects\/[a-z0-9/_-]+\.webp$/i.test(url.pathname)
    ) {
      return url.pathname;
    }
  } catch {
    // Relative paths are already ready for next/image.
  }
  return imageUrl;
}

function toPublicProject(row: ProjectRow): PublicProject | null {
  if (!Array.isArray(row.images) || row.images.length === 0) return null;
  const images = row.images
    .filter(
      (image) =>
        image &&
        typeof image.id === "string" &&
        typeof image.image_url === "string" &&
        typeof image.alt_text === "string",
    )
    .map((image) => ({
      id: image.id,
      src: publicImageSource(image.image_url),
      alt: image.alt_text,
    }));
  if (!images.length) return null;

  const hero = images.find((image) => image.id === row.hero_image_id) || images[0];
  const x = Math.min(100, Math.max(0, Number(row.hero_position_x) || 50));
  const y = Math.min(100, Math.max(0, Number(row.hero_position_y) || 50));

  return {
    id: row.slug,
    name: row.name,
    country: row.country,
    client: row.client,
    hero: { src: hero.src, position: `${x}% ${y}%` },
    images,
  };
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return fallbackProjects;

  try {
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug,name,country,client,images,hero_image_id,hero_position_x,hero_position_y",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) return fallbackProjects;
    return (data as ProjectRow[])
      .map(toPublicProject)
      .filter((project): project is PublicProject => Boolean(project));
  } catch {
    return fallbackProjects;
  }
}
