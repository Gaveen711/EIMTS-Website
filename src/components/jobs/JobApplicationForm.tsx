"use client";

import { useState, type FormEvent } from "react";

export function JobApplicationForm({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const cv = formData.get("cv");

    if (!(cv instanceof File) || !cv.size) {
      setMessage("Please attach your CV.");
      return;
    }
    if (cv.size > 5 * 1024 * 1024) {
      setMessage("Your CV must be 5 MB or smaller.");
      return;
    }

    setBusy(true);
    setMessage("Sending your application…");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message);
      form.reset();
      setMessage("Your application has been submitted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not submit your application.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="job_title" value={jobTitle} />
      <label>
        Full name
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        Age
        <input name="age" type="number" min="18" max="99" required />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        CV
        <input
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
        />
      </label>
      <button type="submit" disabled={busy}>
        {busy ? "Submitting…" : "Apply for this vacancy"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
