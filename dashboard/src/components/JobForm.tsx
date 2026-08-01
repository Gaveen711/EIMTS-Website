import type { JobRecord } from "@eimts/database";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  job?: JobRecord;
};

export function JobForm({ action, job }: Props) {
  return (
    <form className="editor-form" action={action}>
      <section className="form-section">
        <div>
          <p className="eyebrow">Vacancy details</p>
          <h2>What candidates will see</h2>
        </div>
        <div className="form-grid">
          <label className="full">
            Job title
            <input name="title" defaultValue={job?.title} required />
          </label>
          <label className="full">
            URL slug
            <input
              name="slug"
              defaultValue={job?.slug}
              placeholder="Created automatically from the title"
            />
          </label>
          <label>
            Country
            <input name="country" defaultValue={job?.country} required />
          </label>
          <label>
            Location
            <input name="location" defaultValue={job?.location || ""} />
          </label>
          <label>
            Category
            <input name="category" defaultValue={job?.category} required />
          </label>
          <label>
            Employment type
            <select
              name="employment_type"
              defaultValue={job?.employment_type || "Full-time"}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Temporary</option>
            </select>
          </label>
          <label>
            Minimum salary
            <input
              name="salary_min"
              type="number"
              min="0"
              defaultValue={job?.salary_min ?? ""}
            />
          </label>
          <label>
            Maximum salary
            <input
              name="salary_max"
              type="number"
              min="0"
              defaultValue={job?.salary_max ?? ""}
            />
          </label>
          <label>
            Currency
            <input
              name="currency"
              maxLength={3}
              defaultValue={job?.currency || "LKR"}
            />
          </label>
          <label>
            Closing date
            <input
              name="expires_at"
              type="date"
              defaultValue={job?.expires_at?.slice(0, 10) || ""}
            />
          </label>
          <label className="full">
            Short summary
            <textarea
              name="summary"
              rows={3}
              defaultValue={job?.summary}
              required
            />
          </label>
          <label className="full">
            Full description
            <textarea
              name="description"
              rows={10}
              defaultValue={job?.description}
              required
            />
          </label>
          <label className="full">
            Requirements
            <textarea
              name="requirements"
              rows={6}
              defaultValue={job?.requirements.join("\n")}
              placeholder="Add one requirement per line"
            />
          </label>
          <label className="full">
            Job image URL
            <input name="image_url" type="url" defaultValue={job?.image_url || ""} />
          </label>
        </div>
      </section>
      <aside className="publish-panel">
        <h2>Publishing</h2>
        <label>
          Status
          <select name="status" defaultValue={job?.status || "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <label className="check-row">
          <input name="urgent" type="checkbox" defaultChecked={job?.urgent} />
          Mark as urgent
        </label>
        <label className="check-row">
          <input name="featured" type="checkbox" defaultChecked={job?.featured} />
          Feature on homepage
        </label>
        <button className="primary-button" type="submit">
          {job ? "Save changes" : "Create vacancy"}
        </button>
      </aside>
    </form>
  );
}
