import type { JobRecord } from "@eimts/database";
import { notFound, redirect } from "next/navigation";
import { updateJob } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { JobForm } from "@/components/JobForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
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

  const { id } = await params;
  const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (!data) notFound();

  const job = data as JobRecord;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="editor-title">
          <p className="eyebrow">Edit vacancy</p>
          <h1>{job.title}</h1>
          <p>Changes appear publicly after the vacancy is published.</p>
        </section>
        <JobForm action={updateJob.bind(null, job.id)} job={job} />
      </main>
    </div>
  );
}
