"use server";

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

  return { supabase, user };
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
