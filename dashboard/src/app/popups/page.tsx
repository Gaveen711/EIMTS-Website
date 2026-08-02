import Link from "next/link";
import type { PopupRecord } from "@eimts/database";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SetupRequired } from "@/components/SetupRequired";
import { deletePopup, setPopupActive } from "@/app/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function popupState(popup: PopupRecord) {
  if (!popup.active) return "inactive";
  const now = Date.now();
  if (popup.starts_at && new Date(popup.starts_at).getTime() > now) {
    return "scheduled";
  }
  if (popup.ends_at && new Date(popup.ends_at).getTime() < now) {
    return "ended";
  }
  return "live";
}

const stateLabels: Record<string, string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
  inactive: "Inactive",
};

export default async function PopupsPage() {
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
  const role = profile?.role || "viewer";

  const { data } = await supabase
    .from("popups")
    .select("*")
    .order("updated_at", { ascending: false });
  const popups = (data || []) as PopupRecord[];
  const liveCount = popups.filter((popup) => popupState(popup) === "live").length;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Website announcements</p>
            <h1>Popups</h1>
            <p>
              Promote urgent vacancies or announcements on the public find-jobs
              page.
            </p>
          </div>
          {role !== "viewer" && (
            <Link className="primary-button" href="/popups/new">
              Add popup
            </Link>
          )}
        </section>

        <section className="jobs-table-card">
          <div className="table-heading">
            <h2>All popups</h2>
            <span>
              {liveCount ? `${liveCount} live now` : "None live right now"}
            </span>
          </div>
          {popups.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Popup</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {popups.map((popup) => {
                    const state = popupState(popup);
                    return (
                      <tr key={popup.id}>
                        <td>
                          <strong>{popup.title}</strong>
                          {popup.message && <small>{popup.message}</small>}
                        </td>
                        <td>
                          {popup.starts_at || popup.ends_at
                            ? `${popup.starts_at?.slice(0, 10) || "Now"} → ${popup.ends_at?.slice(0, 10) || "No end"}`
                            : "Always"}
                        </td>
                        <td>
                          <span
                            className={`status status-popup-${state}`}
                          >
                            {stateLabels[state]}
                          </span>
                        </td>
                        <td className="row-actions">
                          <Link href={`/popups/${popup.id}`}>Edit</Link>
                          {role !== "viewer" && (
                            <form
                              action={setPopupActive.bind(
                                null,
                                popup.id,
                                !popup.active,
                              )}
                            >
                              <button type="submit">
                                {popup.active ? "Deactivate" : "Activate"}
                              </button>
                            </form>
                          )}
                          {role === "admin" && (
                            <form action={deletePopup.bind(null, popup.id)}>
                              <button className="danger-button" type="submit">
                                Delete
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No popups yet</h3>
              <p>
                Create one to announce new vacancies or promotions on the
                find-jobs page.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
