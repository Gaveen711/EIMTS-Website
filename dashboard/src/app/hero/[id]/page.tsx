import type { HeroSlideRecord } from "@eimts/database";
import { notFound, redirect } from "next/navigation";
import { updateHeroSlide } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HeroSlideForm } from "@/components/HeroSlideForm";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditHeroSlidePage({
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
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) notFound();

  const slide = data as HeroSlideRecord;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="editor-title">
          <p className="eyebrow">Edit hero slide</p>
          <h1>{slide.title}</h1>
          <p>Changes appear on the homepage within about a minute.</p>
        </section>
        <HeroSlideForm action={updateHeroSlide.bind(null, slide.id)} slide={slide} />
      </main>
    </div>
  );
}
