"use client";

import { useRef, useState } from "react";
import {
  acceptedSourceImageExtensions,
  uploadWebpImage,
} from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/browser";

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
  hint = "JPG, PNG or WebP — converted to an optimized WebP before upload.",
  required,
}: Props) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    setResult("");

    const supabase = createClient();
    if (!supabase) {
      setError("Connect the Supabase project before uploading images.");
      return;
    }

    setBusy(true);
    try {
      const uploaded = await uploadWebpImage({
        supabase,
        bucket: "job-media",
        folder,
        file,
      });
      setUrl(uploaded.url);
      setResult(
        `WebP ready — ${Math.max(1, Math.round(uploaded.storedBytes / 1024))} KB, ${uploaded.width} × ${uploaded.height}px.`,
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded.",
      );
    } finally {
      setBusy(false);
    }
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
        accept={acceptedSourceImageExtensions}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {result && <p className="form-success">{result}</p>}
      {error && <p className="form-message">{error}</p>}
    </div>
  );
}
