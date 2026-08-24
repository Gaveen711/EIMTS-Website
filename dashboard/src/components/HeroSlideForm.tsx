import type { HeroSlideRecord } from "@eimts/database";
import { toColomboDateInput } from "@/lib/dates";
import { ImageDropzone } from "./ImageDropzone";
import { SubmitButton } from "./SubmitButton";
import { Toggle } from "./Toggle";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  slide?: HeroSlideRecord;
};

export function HeroSlideForm({ action, slide }: Props) {
  return (
    <form className="editor-form" action={action}>
      <section className="form-section">
        <div>
          <p className="eyebrow">Slide details</p>
          <h2>Shown at the top of the homepage</h2>
          <p className="form-hint">
            Use a wide image (around 1824 × 1024 px works well) with the focus
            away from the left side, where the text sits.
          </p>
        </div>
        <div className="form-grid">
          <label className="full">
            Small label above the title (optional)
            <input
              name="kicker"
              defaultValue={slide?.kicker || ""}
              placeholder="e.g. Celebrating 32 years of Emerald Isle"
            />
          </label>
          <label className="full">
            Headline *
            <input
              name="title"
              defaultValue={slide?.title}
              placeholder="e.g. Wishing you a peaceful Vesak from our family to yours."
              required
            />
          </label>
          <label className="full">
            Supporting sentence *
            <textarea
              name="copy"
              rows={3}
              defaultValue={slide?.copy}
              placeholder="One or two short sentences under the headline."
              required
            />
          </label>
          <ImageDropzone
            defaultUrl={slide?.image_url}
            folder="hero"
            label="Background image"
            hint="JPG, PNG or WebP — resized and converted to WebP before upload."
            required
          />
          <label>
            Button label (optional)
            <input
              name="cta_label"
              defaultValue={slide ? slide.cta_label || "" : "Explore foreign jobs"}
              placeholder="e.g. Explore foreign jobs"
            />
          </label>
          <label>
            Button link
            <input
              name="cta_url"
              defaultValue={slide ? slide.cta_url || "" : "/foreign-job-vacancies/"}
              placeholder="/foreign-job-vacancies/ or https://…"
            />
          </label>
          <label>
            Second link label (optional)
            <input
              name="cta2_label"
              defaultValue={slide ? slide.cta2_label || "" : "Hire exceptional talent"}
              placeholder="e.g. Hire exceptional talent"
            />
          </label>
          <label>
            Second link
            <input
              name="cta2_url"
              defaultValue={slide ? slide.cta2_url || "" : "/client-recruitment-solutions/"}
              placeholder="/client-recruitment-solutions/ or https://…"
            />
          </label>
          <label>
            Show from (optional)
            <input
              name="starts_at"
              type="date"
              defaultValue={toColomboDateInput(slide?.starts_at)}
            />
          </label>
          <label>
            Show until (optional)
            <input
              name="ends_at"
              type="date"
              defaultValue={toColomboDateInput(slide?.ends_at)}
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
          defaultChecked={slide ? slide.active : true}
        />
        <Toggle
          name="is_takeover"
          label="Occasion takeover"
          hint="While live, this slide replaces the whole rotation — for an anniversary, Vesak or campaign post. The normal slides return automatically when it ends."
          defaultChecked={slide?.is_takeover}
        />
        <SubmitButton label={slide ? "Save changes" : "Create slide"} />
        <p className="panel-hint">
          Changes appear on the homepage within about a minute. Set both dates
          on an occasion post so it retires itself.
        </p>
      </aside>
    </form>
  );
}
