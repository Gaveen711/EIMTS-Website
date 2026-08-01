import { redirect } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type ApplicationRow = {
  id: string;
  full_name: string;
  age: number;
  email: string;
  phone: string | null;
  cv_path: string;
  status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
  created_at: string;
  jobs: { title: string } | null;
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("applications")
    .select(
      "id,full_name,age,email,phone,cv_path,status,created_at,jobs(title)",
    )
    .order("created_at", { ascending: false });
  const applications = (data || []) as unknown as ApplicationRow[];

  const rows = await Promise.all(
    applications.map(async (application) => {
      const { data: signed } = await supabase.storage
        .from("candidate-cvs")
        .createSignedUrl(application.cv_path, 60 * 15);
      return { ...application, cvUrl: signed?.signedUrl || null };
    }),
  );

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Candidate pipeline</p>
            <h1>Applications</h1>
            <p>Review CVs and track each candidate through the recruitment process.</p>
          </div>
        </section>

        <section className="jobs-table-card">
          <div className="table-heading">
            <h2>Recent applications</h2>
            <span>{rows.length} records</span>
          </div>
          {rows.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Vacancy</th>
                    <th>Contact</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>CV</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.full_name}</strong>
                        <small>Age {application.age}</small>
                      </td>
                      <td>{application.jobs?.title || "Vacancy unavailable"}</td>
                      <td>
                        <a href={`mailto:${application.email}`}>
                          {application.email}
                        </a>
                        {application.phone && <small>{application.phone}</small>}
                      </td>
                      <td>
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(application.created_at))}
                      </td>
                      <td>
                        <form
                          action={async (formData) => {
                            "use server";
                            await updateApplicationStatus(
                              application.id,
                              String(formData.get("status")),
                            );
                          }}
                        >
                          <select
                            className="compact-select"
                            name="status"
                            defaultValue={application.status}
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                          <button className="small-save" type="submit">
                            Save
                          </button>
                        </form>
                      </td>
                      <td>
                        {application.cvUrl ? (
                          <a
                            className="table-link"
                            href={application.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open CV
                          </a>
                        ) : (
                          "Unavailable"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No applications yet</h3>
              <p>New online applications will appear here automatically.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
