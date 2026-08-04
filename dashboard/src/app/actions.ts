"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    expires_at: text(formData, "expires_at") || null,
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
  const endsAt = text(formData, "ends_at");
  return {
    title: text(formData, "title"),
    message: text(formData, "message") || null,
    image_url: text(formData, "image_url") || null,
    link_url: text(formData, "link_url") || null,
    link_label: text(formData, "link_label") || null,
    active: formData.get("active") === "on",
    starts_at: text(formData, "starts_at") || null,
    // The end date should include the whole final day.
    ends_at: endsAt ? `${endsAt}T23:59:59` : null,
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
