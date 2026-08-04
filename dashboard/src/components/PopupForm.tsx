import type { PopupRecord } from "@eimts/database";
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
            Visitors see the popup once per browsing session. Keep the message
            short — one announcement or promotion at a time works best.
          </p>
        </div>
        <div className="form-grid">
          <label className="full">
            Headline *
            <input
              name="title"
              defaultValue={popup?.title}
              placeholder="e.g. 50 new vacancies in Turkey this month"
              required
            />
          </label>
          <label className="full">
            Message
            <textarea
              name="message"
              rows={4}
              defaultValue={popup?.message || ""}
              placeholder="A short supporting sentence or two."
            />
          </label>
          <ImageDropzone defaultUrl={popup?.image_url} />
          <label>
            Button link (optional)
            <input
              name="link_url"
              type="url"
              defaultValue={popup?.link_url || ""}
              placeholder="https://…"
            />
          </label>
          <label>
            Button label
            <input
              name="link_label"
              defaultValue={popup?.link_label || ""}
              placeholder="e.g. View vacancies"
            />
          </label>
          <label>
            Show from (optional)
            <input
              name="starts_at"
              type="date"
              defaultValue={popup?.starts_at?.slice(0, 10) || ""}
            />
          </label>
          <label>
            Show until (optional)
            <input
              name="ends_at"
              type="date"
              defaultValue={popup?.ends_at?.slice(0, 10) || ""}
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
