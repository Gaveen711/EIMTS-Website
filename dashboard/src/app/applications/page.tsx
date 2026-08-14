import type { ApplicationRecord } from "@eimts/database";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ApplicationRow = ApplicationRecord & {
  jobs: {
    id: string;
    title: string;
    country: string;
    category: string;
  } | null;
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

const TABLE_LIMIT = 100;

// The vacancy stored with the CV wins over the live job, so renaming a job
// never relabels applications already received against it.
function vacancyName(application: ApplicationRow) {
  return (
    application.job_title || application.jobs?.title || "Vacancy unavailable"
  );
}

export default async function ApplicationsPage() {
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
    .from("applications")
    .select("*,jobs(id,title,country,category)")
    .order("created_at", { ascending: false });
  const applications = (data || []) as unknown as ApplicationRow[];

  // Every status an admin can pick gets its own box, so the totals cannot
  // drift from the options in the dropdown.
  const statusTotals = new Map(statusOptions.map((option) => [option.value, 0]));
  for (const application of applications) {
    statusTotals.set(
      application.status,
      (statusTotals.get(application.status) || 0) + 1,
    );
  }

  const byVacancy = [...applications
    .reduce((counts, application) => {
      const title = vacancyName(application);
      counts.set(title, (counts.get(title) || 0) + 1);
      return counts;
    }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]);

  // Only the rows shown in the table need signed CV links.
  const recent = applications.slice(0, TABLE_LIMIT);
  const urlByPath = new Map<string, string>();
  if (recent.length) {
    const { data: signed } = await supabase.storage
      .from("candidate-cvs")
      .createSignedUrls(recent.map((a) => a.cv_path), 60 * 15);
    for (const item of signed || []) {
      if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
    }
  }

  const dateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || "Staff"} />
      <main className="dashboard-main dashboard-main-wide">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Candidate pipeline</p>
            <h1>Applications</h1>
            <p>
              Every CV submitted through the website, with a copy already sent
              to the recruitment inbox.
            </p>
          </div>
        </section>

        <section
          className="metric-grid metric-grid-compact"
          aria-label="Application totals"
        >
          <article>
            <span>CVs received</span>
            <strong>{applications.length}</strong>
          </article>
          {statusOptions.map((option) => (
            <article
              key={option.value}
              className={`metric-status metric-app-${option.value}`}
            >
              <span>{option.label}</span>
              <strong>{statusTotals.get(option.value) || 0}</strong>
            </article>
          ))}
        </section>

        <div className="applications-layout">
          <section className="jobs-table-card">
            <div className="table-heading">
              <h2>Recent applications</h2>
              <span>
                {applications.length > TABLE_LIMIT
                  ? `Latest ${TABLE_LIMIT} of ${applications.length}`
                  : `${applications.length} records`}
              </span>
            </div>
            {recent.length ? (
              <div className="table-scroll">
                <table className="applications-table">
                  <colgroup>
                    <col className="col-candidate" />
                    <col className="col-age" />
                    <col className="col-vacancy" />
                    <col className="col-contact" />
                    <col className="col-received" />
                    <col className="col-status" />
                    <col className="col-cv" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th className="cell-age">Age</th>
                      <th>Vacancy</th>
                      <th>Contact</th>
                      <th>Received</th>
                      <th>Status</th>
                      <th>
                        <span className="sr-only">CV</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((application) => {
                      const cvUrl = urlByPath.get(application.cv_path);
                      const vacancy = vacancyName(application);
                      const vacancyMeta = [
                        application.jobs?.country,
                        application.jobs?.category,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <tr key={application.id}>
                          <td>
                            <strong>{application.full_name}</strong>
                          </td>
                          <td className="cell-age">{application.age}</td>
                          <td className="cell-vacancy">
                            {application.jobs ? (
                              <Link
                                href={`/jobs/${application.jobs.id}`}
                                title={vacancy}
                              >
                                {vacancy}
                              </Link>
                            ) : (
                              <strong title={vacancy}>{vacancy}</strong>
                            )}
                            {vacancyMeta && <small>{vacancyMeta}</small>}
                          </td>
                          <td>
                            <a href={`mailto:${application.email}`}>
                              {application.email}
                            </a>
                            {application.phone && (
                              <small>{application.phone}</small>
                            )}
                          </td>
                          <td className="cell-received">
                            {dateFormat.format(new Date(application.created_at))}
                          </td>
                          <td>
                            {role !== "viewer" ? (
                              <form
                                className="status-form"
                                action={updateApplicationStatus.bind(
                                  null,
                                  application.id,
                                )}
                              >
                                <select
                                  className="compact-select"
                                  name="status"
                                  defaultValue={application.status}
                                  aria-label={`Status for ${application.full_name}`}
                                >
                                  {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button className="chip-save" type="submit">
                                  Save
                                </button>
                              </form>
                            ) : (
                              <span
                                className={`status status-app-${application.status}`}
                              >
                                {application.status}
                              </span>
                            )}
                          </td>
                          <td className="row-actions">
                            {cvUrl ? (
                              <a href={cvUrl} target="_blank" rel="noreferrer">
                                Open CV
                              </a>
                            ) : (
                              <span className="cv-unavailable">Unavailable</span>
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
                <h3>No applications yet</h3>
                <p>New online applications will appear here automatically.</p>
              </div>
            )}
          </section>

          <section className="jobs-table-card vacancy-counts">
            <div className="table-heading">
              <h2>CVs by vacancy</h2>
              <span>{byVacancy.length} vacancies</span>
            </div>
            {byVacancy.length ? (
              <ul>
                {byVacancy.map(([title, count]) => (
                  <li key={title}>
                    <span title={title}>{title}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>Counts appear once the first CV arrives.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
