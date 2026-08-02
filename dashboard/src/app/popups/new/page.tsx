import { redirect } from "next/navigation";
import { createPopup } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PopupForm } from "@/components/PopupForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewPopupPage() {
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
          <p className="eyebrow">New popup</p>
          <h1>Create a website popup</h1>
          <p>Announce promotions or urgent vacancies to website visitors.</p>
        </section>
        <PopupForm action={createPopup} />
      </main>
    </div>
  );
}
