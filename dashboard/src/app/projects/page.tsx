import Link from "next/link";
import type { ProjectRecord } from "@eimts/database";
import { redirect } from "next/navigation";
import {
  deleteProject,
  migrateBundledProjectImages,
  moveProject,
  setProjectActive,
} from "@/app/actions";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsDashboardPage() {
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
  const isAdmin = profile?.role === "admin";

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const projects = (data || []) as ProjectRecord[];

  return (
    <div className="dashboard-shell">
      <DashboardHeader email={user.email || profile?.full_name || "Staff"} />
      <main className="dashboard-main dashboard-main-wide">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Portfolio publishing</p>
            <h1>Projects</h1>
            <p>Control every project, photograph, hero crop and display order.</p>
          </div>
          {isAdmin && (
            <Link className="primary-button" href="/projects/new">
              Add project
            </Link>
          )}
        </section>

        <section className="metric-grid" aria-label="Project totals">
          <article>
            <span>Total projects</span>
            <strong>{projects.length}</strong>
          </article>
          <article>
            <span>Visible</span>
            <strong>{projects.filter((project) => project.active).length}</strong>
          </article>
          <article>
            <span>Photographs</span>
            <strong>
              {projects.reduce((total, project) => total + project.images.length, 0)}
            </strong>
          </article>
          <article>
            <span>Fully on Supabase</span>
            <strong>
              {projects.filter((project) =>
                project.images.every((image) => Boolean(image.storage_path)),
              ).length}
            </strong>
          </article>
        </section>

        <section className="jobs-table-card">
          <div className="table-heading">
            <h2>Project library</h2>
            <span>{isAdmin ? "Admin editing enabled" : "Read-only access"}</span>
          </div>
          {error ? (
            <div className="empty-state">
              <h3>The projects table is missing</h3>
              <p>
                Run supabase/migrations/202608240001_projects.sql against the
                Supabase project, then reload this page.
              </p>
            </div>
          ) : projects.length > 0 ? (
            <div className="table-scroll">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Photos</th>
                    <th>Delivery</th>
                    <th>Visibility</th>
                    <th>Order</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => {
                    const hero =
                      project.images.find((image) => image.id === project.hero_image_id) ||
                      project.images[0];
                    const bundledCount = project.images.filter(
                      (image) => !image.storage_path,
                    ).length;

                    return (
                      <tr key={project.id}>
                        <td>
                          <div className="project-table-title">
                            {hero && <img src={hero.image_url} alt="" />}
                            <span>
                              <strong>{project.name}</strong>
                              <small>{project.country} · {project.client}</small>
                            </span>
                          </div>
                        </td>
                        <td>{project.images.length}</td>
                        <td>
                          <span
                            className={`status ${bundledCount ? "status-draft" : "status-published"}`}
                          >
                            {bundledCount ? `${bundledCount} bundled` : "Supabase"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status ${project.active ? "status-published" : "status-standard"}`}
                          >
                            {project.active ? "Visible" : "Hidden"}
                          </span>
                        </td>
                        <td className="row-actions project-order-actions">
                          {isAdmin ? (
                            <>
                              <form action={moveProject.bind(null, project.id, "up")}>
                                <button type="submit" disabled={index === 0} aria-label="Move project earlier">↑</button>
                              </form>
                              <form action={moveProject.bind(null, project.id, "down")}>
                                <button
                                  type="submit"
                                  disabled={index === projects.length - 1}
                                  aria-label="Move project later"
                                >
                                  ↓
                                </button>
                              </form>
                            </>
                          ) : (
                            project.sort_order
                          )}
                        </td>
                        <td className="row-actions project-row-actions">
                          {isAdmin ? (
                            <>
                              <Link href={`/projects/${project.id}`}>Edit</Link>
                              <form action={setProjectActive.bind(null, project.id, !project.active)}>
                                <button type="submit">
                                  {project.active ? "Hide" : "Show"}
                                </button>
                              </form>
                              {bundledCount > 0 && (
                                <form action={migrateBundledProjectImages.bind(null, project.id)}>
                                  <button type="submit">Move to storage</button>
                                </form>
                              )}
                              <form action={deleteProject.bind(null, project.id)}>
                                <ConfirmActionButton
                                  className="danger-button"
                                  message={`Delete ${project.name} and its Supabase images? This cannot be undone.`}
                                >
                                  Delete
                                </ConfirmActionButton>
                              </form>
                            </>
                          ) : (
                            <span>—</span>
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
              <h3>No projects yet</h3>
              <p>Add the first project and upload its gallery as optimized WebP files.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
