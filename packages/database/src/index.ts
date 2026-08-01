export type JobStatus = "draft" | "published" | "paused" | "expired";

export type JobRecord = {
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
  image_position: string;
  urgent: boolean;
  featured: boolean;
  status: JobStatus;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRole = "admin" | "editor" | "viewer";
