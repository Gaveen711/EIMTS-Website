import type { ProjectRecord } from "@eimts/database";
import { ProjectMediaField } from "./ProjectMediaField";
import { SubmitButton } from "./SubmitButton";
import { Toggle } from "./Toggle";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectRecord;
};

export function ProjectForm({ action, project }: Props) {
  return (
    <form className="editor-form" action={action}>
      <section className="form-section project-form-section">
        <div>
          <p className="eyebrow">Project details</p>
          <h2>The story visitors will see</h2>
          <p className="form-hint">
            Upload the full gallery here. Every file is converted to WebP before
            it reaches storage, so large camera originals never reach the website.
          </p>
        </div>
        <div className="form-grid">
          <label className="full">
            Project name *
            <input
              name="name"
              defaultValue={project?.name}
              placeholder="e.g. McDonalds Kuwait"
              required
            />
          </label>
          <label>
            Country *
            <input
              name="country"
              defaultValue={project?.country}
              placeholder="e.g. Kuwait"
              required
            />
          </label>
          <label>
            Client *
            <input
              name="client"
              defaultValue={project?.client}
              placeholder="e.g. McDonalds"
              required
            />
          </label>
          <ProjectMediaField
            defaultImages={project?.images}
            defaultHeroImageId={project?.hero_image_id}
          />
          <div className="full project-focus-fields">
            <div>
              <span className="field-label">Hero crop focus</span>
              <small className="field-help">
                Move the focal point if faces or important details are being cropped.
              </small>
            </div>
            <label>
              Horizontal position
              <div className="input-suffix">
                <input
                  name="hero_position_x"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={project?.hero_position_x ?? 50}
                  required
                />
                <span>%</span>
              </div>
            </label>
            <label>
              Vertical position
              <div className="input-suffix">
                <input
                  name="hero_position_y"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={project?.hero_position_y ?? 50}
                  required
                />
                <span>%</span>
              </div>
            </label>
          </div>
          <details className="full advanced-options">
            <summary>Advanced: ordering and web address</summary>
            <div className="project-advanced-grid">
              <label>
                Display order
                <input
                  name="sort_order"
                  type="number"
                  min="0"
                  defaultValue={project?.sort_order ?? 10}
                />
                <small className="field-help">Lower numbers appear first.</small>
              </label>
              <label>
                URL slug
                <input
                  name="slug"
                  defaultValue={project?.slug}
                  placeholder="Created from the project name"
                />
                <small className="field-help">Used for the page anchor link.</small>
              </label>
            </div>
          </details>
        </div>
      </section>
      <aside className="publish-panel">
        <h2>Visibility</h2>
        <Toggle
          name="active"
          label="Show on the projects page"
          hint="Turn this off to prepare changes without publishing them."
          defaultChecked={project ? project.active : true}
        />
        <SubmitButton label={project ? "Save changes" : "Create project"} />
        <p className="panel-hint">
          The public page reads this content directly from Supabase. Allow up to
          one minute for cached pages to refresh.
        </p>
      </aside>
    </form>
  );
}
