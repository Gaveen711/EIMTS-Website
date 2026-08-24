import type { ProjectRecord } from "@eimts/database";
import { notFound, redirect } from "next/navigation";
import { updateProject } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectForm } from "@/components/ProjectForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/projects");

  const { id } = await params;
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const project = data as ProjectRecord;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main dashboard-main-wide">
        <section className="editor-title">
          <p className="eyebrow">Edit project</p>
          <h1>{project.name}</h1>
          <p>Reorder the gallery, replace photographs, or adjust the hero crop.</p>
        </section>
        <ProjectForm
          action={updateProject.bind(null, project.id)}
          project={project}
        />
      </main>
    </div>
  );
}
