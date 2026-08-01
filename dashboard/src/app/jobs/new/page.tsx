import { redirect } from "next/navigation";
import { createJob } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { JobForm } from "@/components/JobForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="editor-title">
          <p className="eyebrow">New vacancy</p>
          <h1>Create a job posting</h1>
          <p>Save it as a draft or publish it immediately.</p>
        </section>
        <JobForm action={createJob} />
      </main>
    </div>
  );
}
