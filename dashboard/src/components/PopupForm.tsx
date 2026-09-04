import type { PopupRecord } from "@eimts/database";
import { toColomboDateInput } from "@/lib/dates";
import { ImageDropzone } from "./ImageDropzone";
import { SubmitButton } from "./SubmitButton";
import { Toggle } from "./Toggle";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  popup?: PopupRecord;
};

export function PopupForm({ action, popup }: Props) {
  return (
    <form className="editor-form" action={action}>
      <section className="form-section">
        <div>
          <p className="eyebrow">Popup details</p>
          <h2>Shown on the find-jobs page</h2>
          <p className="form-hint">
            Visitors see one image popup on the find-jobs page. Clicking the
            image opens the destination you provide below.
          </p>
        </div>
        <div className="form-grid">
          <label className="full">
            Internal name / image alt text (optional)
            <input
              name="title"
              defaultValue={popup?.title}
              placeholder="e.g. Turkey recruitment campaign"
            />
          </label>
          <ImageDropzone
            defaultUrl={popup?.image_url}
            folder="popups"
            label="Popup image *"
            hint="JPG, PNG or WebP — converted to WebP before upload."
            required
          />
          <label className="full">
            Destination URL (optional)
            <input
              name="link_url"
              type="text"
              inputMode="url"
              defaultValue={popup?.link_url || ""}
              placeholder="https://example.com or /foreign-job-vacancies/"
            />
          </label>
          <label>
            Show from (optional)
            <input
              name="starts_at"
              type="date"
              defaultValue={toColomboDateInput(popup?.starts_at)}
            />
          </label>
          <label>
            Show until (optional)
            <input
              name="ends_at"
              type="date"
              defaultValue={toColomboDateInput(popup?.ends_at)}
            />
          </label>
        </div>
      </section>
      <aside className="publish-panel">
        <h2>Visibility</h2>
        <Toggle
          name="active"
          label="Show on the website"
          hint="Visitors only see it inside the date window."
          defaultChecked={popup?.active}
        />
        <SubmitButton label={popup ? "Save changes" : "Create popup"} />
        <p className="panel-hint">
          Only active popups inside their date window appear to visitors. The
          newest active popup is shown.
        </p>
      </aside>
    </form>
  );
}
