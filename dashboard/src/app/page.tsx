import Link from "next/link";
import type { JobRecord } from "@eimts/database";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SetupRequired } from "@/components/SetupRequired";
import { updateJobStatus } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor", "viewer"].includes(profile.role)) {
    return (
      <main className="setup-page">
        <section className="setup-card">
          <p className="eyebrow">Access pending</p>
          <h1>Your staff role has not been assigned</h1>
          <p>Ask an administrator to assign your account a dashboard role.</p>
        </section>
      </main>
    );
  }

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("updated_at", { ascending: false });
  const jobs = (data || []) as JobRecord[];
  const publishedCount = jobs.filter((job) => job.status === "published").length;
  const draftCount = jobs.filter((job) => job.status === "draft").length;

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || profile.full_name || "Staff"} />
      <main className="dashboard-main">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Recruitment publishing</p>
            <h1>Vacancies</h1>
            <p>Create, review and publish opportunities shown on the website.</p>
          </div>
          {profile.role !== "viewer" && (
            <Link className="primary-button" href="/jobs/new">
              Add vacancy
            </Link>
          )}
        </section>

        <section className="metric-grid" aria-label="Job totals">
          <article>
            <span>Total vacancies</span>
            <strong>{jobs.length}</strong>
          </article>
          <article>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </article>
          <article>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </article>
        </section>

        <section className="jobs-table-card">
          <div className="table-heading">
            <h2>All vacancies</h2>
            <span>{jobs.length} records</span>
          </div>
          {jobs.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Vacancy</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.title}</strong>
                        <small>{job.category}</small>
                      </td>
                      <td>{job.location || job.country}</td>
                      <td>
                        <span className={`status status-${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(job.updated_at))}
                      </td>
                      <td className="row-actions">
                        <Link href={`/jobs/${job.id}`}>Edit</Link>
                        {profile.role !== "viewer" && job.status !== "published" && (
                          <form
                            action={updateJobStatus.bind(
                              null,
                              job.id,
                              "published",
                            )}
                          >
                            <button type="submit">Publish</button>
                          </form>
                        )}
                        {profile.role !== "viewer" && job.status === "published" && (
                          <form
                            action={updateJobStatus.bind(null, job.id, "paused")}
                          >
                            <button type="submit">Pause</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No vacancies yet</h3>
              <p>Create the first vacancy and keep it as a draft until approved.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
