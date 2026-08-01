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
  const { error } = await supabase.from("jobs").insert(payload);
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

export async function updateApplicationStatus(id: string, status: string) {
  const { supabase } = await requireStaff();
  const allowed = ["new", "reviewing", "shortlisted", "rejected", "hired"];
  if (!allowed.includes(status)) throw new Error("Invalid application status.");

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
