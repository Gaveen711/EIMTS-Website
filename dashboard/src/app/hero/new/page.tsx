import { redirect } from "next/navigation";
import { createHeroSlide } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HeroSlideForm } from "@/components/HeroSlideForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewHeroSlidePage() {
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
          <p className="eyebrow">New hero slide</p>
          <h1>Add a homepage slide</h1>
          <p>
            Join the regular rotation, or switch on “Occasion takeover” for an
            anniversary or festival post.
          </p>
        </section>
        <HeroSlideForm action={createHeroSlide} />
      </main>
    </div>
  );
}
