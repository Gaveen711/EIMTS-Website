"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  defaultUrl?: string | null;
  folder?: string;
  label?: string;
  hint?: string;
  required?: boolean;
};

export function ImageDropzone({
  defaultUrl,
  folder = "covers",
  label = "Job image",
  hint = "JPG, PNG or WebP — up to 5 MB. Shown on the job card and job page.",
  required,
}: Props) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!acceptedTypes.includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Connect the Supabase project before uploading images.");
      return;
    }

    setBusy(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("job-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    setBusy(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("job-media").getPublicUrl(path);
    setUrl(data.publicUrl);
  }

  function pickFile() {
    inputRef.current?.click();
  }

  return (
    <div className="full dropzone-field">
      <span className="field-label">{label}</span>
      {/* Visually hidden but still validatable, so a required image blocks
          submission with the browser's own prompt instead of a server error. */}
      <input
        className="sr-only"
        tabIndex={-1}
        name="image_url"
        value={url}
        onChange={() => {}}
        required={required}
      />
      {url ? (
        <div className="dropzone-preview">
          <img src={url} alt={`${label} preview`} />
          <div className="dropzone-preview-actions">
            <button type="button" onClick={pickFile} disabled={busy}>
              {busy ? "Uploading…" : "Replace image"}
            </button>
            <button type="button" onClick={() => setUrl("")} disabled={busy}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone${dragOver ? " dragover" : ""}`}
          role="button"
          tabIndex={0}
          onClick={pickFile}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              pickFile();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
        >
          <strong>{busy ? "Uploading…" : "Drop an image here, or click to browse"}</strong>
          <small>{hint}</small>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {error && <p className="form-message">{error}</p>}
    </div>
  );
}
