"use server";

import type { ProjectImageRecord } from "@eimts/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { colomboDayEnd, colomboDayStart } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireStaff() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    throw new Error("Your account does not have publishing access.");
  }

  return { supabase, user, profile };
}

async function requireAdmin() {
  const context = await requireStaff();
  if (context.profile.role !== "admin") {
    throw new Error("Only administrators can manage projects.");
  }
  return context;
}

function jobPayload(formData: FormData) {
  const title = text(formData, "title");
  const requestedSlug = text(formData, "slug");
  const status = text(formData, "status") || "draft";
  const expiresAt = text(formData, "expires_at");

  return {
    slug: slugify(requestedSlug || title),
    title,
    country: text(formData, "country"),
    location: text(formData, "location") || null,
    category: text(formData, "category"),
    employment_type: text(formData, "employment_type") || "Full-time",
    currency: (text(formData, "currency") || "LKR").toUpperCase(),
    salary_min: text(formData, "salary_min") || null,
    salary_max: text(formData, "salary_max") || null,
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    requirements: text(formData, "requirements")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
    image_url: text(formData, "image_url") || null,
    urgent: formData.get("urgent") === "on",
    featured: formData.get("featured") === "on",
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    // Keep the vacancy open for the whole closing day in Sri Lanka.
    expires_at: expiresAt ? colomboDayEnd(expiresAt) : null,
  };
}

export async function createJob(formData: FormData) {
  const { supabase, user } = await requireStaff();
  const payload = { ...jobPayload(formData), created_by: user.id };

  let { error } = await supabase.from("jobs").insert(payload);
  if (error?.code === "23505") {
    // Duplicate slug: retry once with a short unique suffix instead of failing.
    payload.slug = `${payload.slug}-${Math.random().toString(36).slice(2, 6)}`;
    ({ error } = await supabase.from("jobs").insert(payload));
  }
  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function updateJob(id: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("jobs")
    .update(jobPayload(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function updateJobStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("jobs")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

function popupPayload(formData: FormData) {
  const startsAt = text(formData, "starts_at");
  const endsAt = text(formData, "ends_at");
  return {
    title: text(formData, "title"),
    message: text(formData, "message") || null,
    image_url: text(formData, "image_url") || null,
    link_url: text(formData, "link_url") || null,
    link_label: text(formData, "link_label") || null,
    active: formData.get("active") === "on",
    starts_at: startsAt ? colomboDayStart(startsAt) : null,
    // The end date should include the whole final day.
    ends_at: endsAt ? colomboDayEnd(endsAt) : null,
  };
}

export async function createPopup(formData: FormData) {
  const { supabase, user } = await requireStaff();
  const payload = { ...popupPayload(formData), created_by: user.id };
  const { error } = await supabase.from("popups").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/popups");
  redirect("/popups");
}

export async function updatePopup(id: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("popups")
    .update(popupPayload(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/popups");
  redirect("/popups");
}

export async function setPopupActive(id: string, active: boolean) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("popups")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/popups");
}

export async function deletePopup(id: string) {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/popups");
}

function heroSlidePayload(formData: FormData) {
  const startsAt = text(formData, "starts_at");
  const endsAt = text(formData, "ends_at");
  const imageUrl = text(formData, "image_url");
  if (!imageUrl) throw new Error("Add a background image for the slide.");

  return {
    kicker: text(formData, "kicker") || null,
    title: text(formData, "title"),
    copy: text(formData, "copy"),
    image_url: imageUrl,
    cta_label: text(formData, "cta_label") || null,
    cta_url: text(formData, "cta_url") || null,
    cta2_label: text(formData, "cta2_label") || null,
    cta2_url: text(formData, "cta2_url") || null,
    is_takeover: formData.get("is_takeover") === "on",
    active: formData.get("active") === "on",
    starts_at: startsAt ? colomboDayStart(startsAt) : null,
    // The end date should include the whole final day.
    ends_at: endsAt ? colomboDayEnd(endsAt) : null,
  };
}

export async function createHeroSlide(formData: FormData) {
  const { supabase, user } = await requireStaff();

  // New slides join the end of the rotation.
  const { data: last } = await supabase
    .from("hero_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const payload = {
    ...heroSlidePayload(formData),
    sort_order: (last?.sort_order ?? 0) + 10,
    created_by: user.id,
  };

  const { error } = await supabase.from("hero_slides").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/hero");
  redirect("/hero");
}

export async function updateHeroSlide(id: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("hero_slides")
    .update(heroSlidePayload(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/hero");
  redirect("/hero");
}

export async function setHeroSlideActive(id: string, active: boolean) {
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("hero_slides")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hero");
}

export async function deleteHeroSlide(id: string) {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/hero");
}

export async function moveHeroSlide(id: string, direction: "up" | "down") {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("hero_slides")
    .select("id,sort_order,is_takeover")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const slides = data || [];

  // Renumber the whole list so duplicate sort orders cannot make the swap a
  // no-op, then swap the moved slide with its neighbour in the rotation.
  // Takeover rows never rotate, so they are skipped over rather than swapped
  // with — one press must always reorder the slides visitors actually see.
  const ordered = slides.map((slide, position) => ({
    id: slide.id,
    sort_order: (position + 1) * 10,
  }));
  const rotation = slides.filter((slide) => !slide.is_takeover);
  const index = rotation.findIndex((slide) => slide.id === id);
  const neighbour = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighbour < 0 || neighbour >= rotation.length) return;

  const moved = ordered.find((item) => item.id === rotation[index].id);
  const other = ordered.find((item) => item.id === rotation[neighbour].id);
  if (!moved || !other) return;
  const swap = moved.sort_order;
  moved.sort_order = other.sort_order;
  other.sort_order = swap;

  for (const [position, slide] of slides.entries()) {
    if (ordered[position].sort_order === slide.sort_order) continue;
    const { error } = await supabase
      .from("hero_slides")
      .update({ sort_order: ordered[position].sort_order })
      .eq("id", slide.id);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/hero");
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const projectStoragePathPattern =
  /^projects\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;
const bundledProjectPathPattern =
  /^\/assets\/projects\/[a-z0-9/_-]+\.webp$/i;
const projectSiteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://emeraldislemanpower.com"
).replace(/\/$/, "");

function integerInRange(
  formData: FormData,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number.parseInt(text(formData, name), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function bundledProjectImageUrl(value: string) {
  if (bundledProjectPathPattern.test(value)) return value;

  try {
    const url = new URL(value);
    if (
      url.origin === projectSiteOrigin &&
      !url.search &&
      bundledProjectPathPattern.test(url.pathname)
    ) {
      return url.toString();
    }
  } catch {
    // The validation error below is deliberately the same for malformed and
    // disallowed URLs so internal storage rules are not exposed in the UI.
  }

  throw new Error("Every project image must be a WebP managed by this website.");
}

async function projectImagesFromForm(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  if (!supabase) throw new Error("Supabase is not configured.");

  let rawImages: unknown;
  try {
    rawImages = JSON.parse(text(formData, "images_json"));
  } catch {
    throw new Error("The project gallery could not be read. Reload and try again.");
  }
  if (!Array.isArray(rawImages) || rawImages.length < 1 || rawImages.length > 30) {
    throw new Error("Add between 1 and 30 project images.");
  }

  const ids = new Set<string>();
  const images = rawImages.map((rawImage) => {
    if (!rawImage || typeof rawImage !== "object") {
      throw new Error("The project gallery contains an invalid image.");
    }
    const input = rawImage as Record<string, unknown>;
    const submittedId = String(input.id || "");
    const id = uuidPattern.test(submittedId) ? submittedId : crypto.randomUUID();
    if (ids.has(id)) throw new Error("The project gallery contains a duplicate image.");
    ids.add(id);

    const altText = String(input.alt_text || "").trim().slice(0, 240);
    if (!altText) throw new Error("Add a description for every project image.");

    const submittedStoragePath = String(input.storage_path || "").trim();
    if (submittedStoragePath) {
      if (!projectStoragePathPattern.test(submittedStoragePath)) {
        throw new Error("A project image has an invalid storage path.");
      }
      const { data } = supabase.storage
        .from("project-media")
        .getPublicUrl(submittedStoragePath);
      return {
        id,
        image_url: data.publicUrl,
        storage_path: submittedStoragePath,
        alt_text: altText,
      } satisfies ProjectImageRecord;
    }

    return {
      id,
      image_url: bundledProjectImageUrl(String(input.image_url || "")),
      storage_path: null,
      alt_text: altText,
    } satisfies ProjectImageRecord;
  });

  const submittedHeroId = text(formData, "hero_image_id");
  const heroImageId = images.some((image) => image.id === submittedHeroId)
    ? submittedHeroId
    : images[0].id;

  return { images, heroImageId };
}

async function projectPayload(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const name = text(formData, "name");
  const country = text(formData, "country");
  const client = text(formData, "client");
  const requestedSlug = text(formData, "slug");
  if (!name) throw new Error("Add a project name.");
  if (!country) throw new Error("Add the project country.");
  if (!client) throw new Error("Add the project client.");

  const slug = slugify(requestedSlug || name);
  if (!slug) throw new Error("Use letters or numbers in the project name or URL slug.");

  const { images, heroImageId } = await projectImagesFromForm(formData, supabase);
  return {
    slug,
    name,
    country,
    client,
    images,
    hero_image_id: heroImageId,
    hero_position_x: integerInRange(formData, "hero_position_x", 50, 0, 100),
    hero_position_y: integerInRange(formData, "hero_position_y", 50, 0, 100),
    sort_order: integerInRange(formData, "sort_order", 10, 0, 100000),
    active: formData.get("active") === "on",
  };
}

function storedProjectPaths(images: ProjectImageRecord[]) {
  return images
    .map((image) => image.storage_path)
    .filter((path): path is string => Boolean(path));
}

async function removeProjectMedia(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  paths: string[],
) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from("project-media").remove(paths);
  if (error) console.error("Could not remove project media", error.message);
}

export async function createProject(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const content = await projectPayload(formData, supabase);
  const payload = { ...content, created_by: user.id };

  let { error } = await supabase.from("projects").insert(payload);
  if (error?.code === "23505") {
    payload.slug = `${payload.slug}-${Math.random().toString(36).slice(2, 6)}`;
    ({ error } = await supabase.from("projects").insert(payload));
  }
  if (error) {
    await removeProjectMedia(supabase, storedProjectPaths(content.images));
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const { data: existing, error: loadError } = await supabase
    .from("projects")
    .select("images")
    .eq("id", id)
    .single();
  if (loadError || !existing) throw new Error(loadError?.message || "Project not found.");

  const previousImages = (existing.images || []) as ProjectImageRecord[];
  const content = await projectPayload(formData, supabase);
  const previousPaths = new Set(storedProjectPaths(previousImages));
  const nextPaths = new Set(storedProjectPaths(content.images));
  const newlyUploadedPaths = [...nextPaths].filter((path) => !previousPaths.has(path));

  const { error } = await supabase.from("projects").update(content).eq("id", id);
  if (error) {
    await removeProjectMedia(supabase, newlyUploadedPaths);
    throw new Error(error.message);
  }

  const retiredPaths = [...previousPaths].filter((path) => !nextPaths.has(path));
  await removeProjectMedia(supabase, retiredPaths);
  revalidatePath("/projects");
  redirect("/projects");
}

export async function setProjectActive(id: string, active: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("projects").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error: loadError } = await supabase
    .from("projects")
    .select("images")
    .eq("id", id)
    .single();
  if (loadError || !data) throw new Error(loadError?.message || "Project not found.");

  const paths = storedProjectPaths((data.images || []) as ProjectImageRecord[]);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await removeProjectMedia(supabase, paths);
  revalidatePath("/projects");
}

export async function moveProject(id: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("id,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const projects = data || [];
  const index = projects.findIndex((project) => project.id === id);
  const neighbour = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighbour < 0 || neighbour >= projects.length) return;

  const ordered = projects.map((project, position) => ({
    id: project.id,
    sort_order: (position + 1) * 10,
  }));
  const swap = ordered[index].sort_order;
  ordered[index].sort_order = ordered[neighbour].sort_order;
  ordered[neighbour].sort_order = swap;

  for (const project of ordered) {
    const original = projects.find((candidate) => candidate.id === project.id);
    if (original?.sort_order === project.sort_order) continue;
    const { error: updateError } = await supabase
      .from("projects")
      .update({ sort_order: project.sort_order })
      .eq("id", project.id);
    if (updateError) throw new Error(updateError.message);
  }
  revalidatePath("/projects");
}

export async function migrateBundledProjectImages(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error: loadError } = await supabase
    .from("projects")
    .select("images")
    .eq("id", id)
    .single();
  if (loadError || !data) throw new Error(loadError?.message || "Project not found.");

  const images = (data.images || []) as ProjectImageRecord[];
  const uploadedPaths: string[] = [];

  try {
    const migrated: ProjectImageRecord[] = [];
    for (const image of images) {
      if (image.storage_path) {
        migrated.push(image);
        continue;
      }

      const sourceUrl = bundledProjectImageUrl(image.image_url);
      const absoluteSourceUrl = sourceUrl.startsWith("/")
        ? `${projectSiteOrigin}${sourceUrl}`
        : sourceUrl;
      const response = await fetch(absoluteSourceUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not download bundled image (${response.status}).`);
      }
      const contentType = response.headers.get("content-type")?.split(";")[0];
      if (contentType !== "image/webp") {
        throw new Error("A bundled project image is not available as WebP yet.");
      }
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 5 * 1024 * 1024) {
        throw new Error("A bundled WebP is larger than the storage limit.");
      }

      const path = `projects/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, bytes, {
          cacheControl: "31536000",
          contentType: "image/webp",
          upsert: false,
        });
      if (uploadError) throw new Error(uploadError.message);
      uploadedPaths.push(path);

      const { data: publicUrl } = supabase.storage
        .from("project-media")
        .getPublicUrl(path);
      migrated.push({ ...image, image_url: publicUrl.publicUrl, storage_path: path });
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({ images: migrated })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);
  } catch (migrationError) {
    await removeProjectMedia(supabase, uploadedPaths);
    throw migrationError;
  }

  revalidatePath("/projects");
}

const applicationStatuses = [
  "new",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

export async function updateApplicationStatus(id: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const status = text(formData, "status");
  if (!applicationStatuses.includes(status)) {
    throw new Error("Unknown application status.");
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/applications");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
