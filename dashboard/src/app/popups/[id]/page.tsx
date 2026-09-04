import type { PopupRecord } from "@eimts/database";
import { notFound, redirect } from "next/navigation";
import { updatePopup } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PopupForm } from "@/components/PopupForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditPopupPage({
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
  const { data } = await supabase
    .from("popups")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) notFound();

  const popup = data as PopupRecord;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="editor-title">
          <p className="eyebrow">Edit popup</p>
          <h1>{popup.title}</h1>
          <p>Replace the image or optionally update where visitors go when they click it.</p>
        </section>
        <PopupForm action={updatePopup.bind(null, popup.id)} popup={popup} />
      </main>
    </div>
  );
}
