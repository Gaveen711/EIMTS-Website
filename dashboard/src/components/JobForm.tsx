import type { JobRecord } from "@eimts/database";
import { ImageDropzone } from "./ImageDropzone";
import { SubmitButton } from "./SubmitButton";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  job?: JobRecord;
};

const countrySuggestions = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Turkey",
  "Israel",
  "Malaysia",
  "Singapore",
  "Maldives",
  "Japan",
  "South Korea",
  "Romania",
  "Poland",
  "Cyprus",
];

const categorySuggestions = [
  "Construction",
  "Welding",
  "Electrical",
  "Plumbing",
  "Engineering",
  "Manufacturing",
  "Hospitality",
  "Housekeeping & Cleaning",
  "Healthcare",
  "Caregiving",
  "Driving & Logistics",
  "Security",
  "Garment & Factory",
  "Agriculture",
  "Domestic Work",
];

const currencies = ["LKR", "USD", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "TRY", "MYR", "SGD", "EUR", "GBP"];

export function JobForm({ action, job }: Props) {
  return (
    <form className="editor-form" action={action}>
      <section className="form-section">
        <div>
          <p className="eyebrow">Vacancy details</p>
          <h2>What candidates will see</h2>
          <p className="form-hint">
            Only the fields marked required are needed to save a draft. You can
            always come back and finish later.
          </p>
        </div>
        <div className="form-grid">
          <label className="full">
            Job title *
            <input
              name="title"
              defaultValue={job?.title}
              placeholder="e.g. Welders for Turkey"
              required
            />
          </label>
          <label>
            Country *
            <input
              name="country"
              list="country-options"
              defaultValue={job?.country}
              placeholder="Start typing to pick"
              required
            />
            <datalist id="country-options">
              {countrySuggestions.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </label>
          <label>
            City or site (optional)
            <input
              name="location"
              defaultValue={job?.location || ""}
              placeholder="e.g. Istanbul"
            />
          </label>
          <label>
            Category *
            <input
              name="category"
              list="category-options"
              defaultValue={job?.category}
              placeholder="Start typing to pick"
              required
            />
            <datalist id="category-options">
              {categorySuggestions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
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
              placeholder="e.g. 199080"
            />
          </label>
          <label>
            Maximum salary
            <input
              name="salary_max"
              type="number"
              min="0"
              defaultValue={job?.salary_max ?? ""}
              placeholder="Leave empty for a fixed salary"
            />
          </label>
          <label>
            Currency
            <select name="currency" defaultValue={job?.currency || "LKR"}>
              {currencies.map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
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
            Short summary *
            <textarea
              name="summary"
              rows={3}
              defaultValue={job?.summary}
              placeholder="One or two sentences shown on the vacancy card."
              required
            />
          </label>
          <label className="full">
            Full description *
            <textarea
              name="description"
              rows={10}
              defaultValue={job?.description}
              placeholder="The complete job description shown on the job page."
              required
            />
          </label>
          <label className="full">
            Requirements
            <textarea
              name="requirements"
              rows={6}
              defaultValue={job?.requirements.join("\n")}
              placeholder={"Add one requirement per line, for example:\nExperience in similar capacity\nAge 21 to 45\nValid passport"}
            />
          </label>
          <ImageDropzone defaultUrl={job?.image_url} />
          <details className="full advanced-options">
            <summary>Advanced: web address (URL slug)</summary>
            <label className="full">
              URL slug
              <input
                name="slug"
                defaultValue={job?.slug}
                placeholder="Created automatically from the title"
              />
              <small className="field-help">
                Leave this empty and it is created from the title. Avoid
                changing it after publishing so shared links keep working.
              </small>
            </label>
          </details>
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
        <SubmitButton label={job ? "Save changes" : "Create vacancy"} />
        <p className="panel-hint">
          Save as a draft first, then publish when the details are approved.
        </p>
      </aside>
    </form>
  );
}
