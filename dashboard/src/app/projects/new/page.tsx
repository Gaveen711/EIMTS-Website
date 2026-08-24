import { redirect } from "next/navigation";
import { createProject } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectForm } from "@/components/ProjectForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
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

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main dashboard-main-wide">
        <section className="editor-title">
          <p className="eyebrow">New project</p>
          <h1>Build a project gallery</h1>
          <p>Add the project once, then manage every future photograph here.</p>
        </section>
        <ProjectForm action={createProject} />
      </main>
    </div>
  );
}
