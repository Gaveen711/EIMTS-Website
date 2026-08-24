"use client";

import type { ProjectImageRecord } from "@eimts/database";
import { useEffect, useRef, useState } from "react";
import {
  acceptedSourceImageExtensions,
  imageAltFromFilename,
  uploadWebpImage,
} from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/browser";

const maxProjectImages = 30;

type Props = {
  defaultImages?: ProjectImageRecord[];
  defaultHeroImageId?: string;
};

export function ProjectMediaField({
  defaultImages = [],
  defaultHeroImageId,
}: Props) {
  const [images, setImages] = useState<ProjectImageRecord[]>(defaultImages);
  const [heroImageId, setHeroImageId] = useState(
    defaultHeroImageId || defaultImages[0]?.id || "",
  );
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validationInputRef = useRef<HTMLInputElement>(null);
  const replaceIdRef = useRef<string | null>(null);
  const draftPathsRef = useRef(new Set<string>());

  useEffect(() => {
    validationInputRef.current?.setCustomValidity("");
  }, [busy, images.length]);

  function pickFiles(replaceId?: string) {
    if (busy) return;
    replaceIdRef.current = replaceId || null;
    fileInputRef.current?.click();
  }

  async function uploadFiles(files: File[]) {
    if (busy) return;
    const replacingId = replaceIdRef.current;
    replaceIdRef.current = null;
    if (!files.length) return;

    if (!replacingId && images.length + files.length > maxProjectImages) {
      setError(`A project can contain up to ${maxProjectImages} images.`);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Connect the Supabase project before uploading images.");
      return;
    }

    setBusy(true);
    setError("");
    setResult("");
    const uploadedImages: ProjectImageRecord[] = [];

    try {
      const selectedFiles = replacingId ? files.slice(0, 1) : files;
      let storedBytes = 0;

      for (const file of selectedFiles) {
        const uploaded = await uploadWebpImage({
          supabase,
          bucket: "project-media",
          folder: "projects",
          file,
        });
        storedBytes += uploaded.storedBytes;
        uploadedImages.push({
          id: crypto.randomUUID(),
          image_url: uploaded.url,
          storage_path: uploaded.path,
          alt_text: imageAltFromFilename(file.name) || "Project photograph",
        });
      }

      uploadedImages.forEach((image) => {
        if (image.storage_path) draftPathsRef.current.add(image.storage_path);
      });

      if (replacingId) {
        const replacement = uploadedImages[0];
        const replacedImage = images.find((image) => image.id === replacingId);
        if (
          replacedImage?.storage_path &&
          draftPathsRef.current.delete(replacedImage.storage_path)
        ) {
          await supabase.storage
            .from("project-media")
            .remove([replacedImage.storage_path]);
        }
        setImages((current) =>
          current.map((image) =>
            image.id === replacingId
              ? {
                  ...replacement,
                  id: image.id,
                  alt_text: image.alt_text || replacement.alt_text,
                }
              : image,
          ),
        );
      } else {
        setImages((current) => [...current, ...uploadedImages]);
        if (!heroImageId && uploadedImages[0]) {
          setHeroImageId(uploadedImages[0].id);
        }
      }

      setResult(
        `${uploadedImages.length} WebP ${uploadedImages.length === 1 ? "image" : "images"} ready — ${Math.max(1, Math.round(storedBytes / 1024))} KB total.`,
      );
    } catch (uploadError) {
      const uploadedPaths = uploadedImages
        .map((image) => image.storage_path)
        .filter((path): path is string => Boolean(path));
      if (uploadedPaths.length) {
        await supabase.storage.from("project-media").remove(uploadedPaths);
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The images could not be uploaded.",
      );
    } finally {
      setBusy(false);
    }
  }

  function removeImage(id: string) {
    const removedImage = images.find((image) => image.id === id);
    if (
      removedImage?.storage_path &&
      draftPathsRef.current.delete(removedImage.storage_path)
    ) {
      const supabase = createClient();
      if (supabase) {
        void supabase.storage
          .from("project-media")
          .remove([removedImage.storage_path]);
      }
    }
    const remaining = images.filter((image) => image.id !== id);
    setImages(remaining);
    if (heroImageId === id) setHeroImageId(remaining[0]?.id || "");
    setResult("Image removed. Save changes to finish the deletion.");
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((current) => {
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  }

  function updateAlt(id: string, altText: string) {
    setImages((current) =>
      current.map((image) =>
        image.id === id ? { ...image, alt_text: altText } : image,
      ),
    );
  }

  return (
    <div className="full project-media-field" aria-busy={busy}>
      <input type="hidden" name="images_json" value={JSON.stringify(images)} />
      <input type="hidden" name="hero_image_id" value={heroImageId} />
      <input
        ref={validationInputRef}
        className="sr-only"
        tabIndex={-1}
        name="_project_gallery_ready"
        aria-label="Project gallery upload status"
        value={!busy && images.length > 0 ? "ready" : ""}
        onChange={() => {}}
        onInvalid={(event) => {
          const message = busy
            ? "Wait for the project images to finish uploading."
            : "Add at least one project image.";
          event.currentTarget.setCustomValidity(message);
          setError(message);
        }}
        required
      />

      <div className="project-media-heading">
        <div>
          <span className="field-label">Project gallery *</span>
          <small>Choose the hero, write useful alt text, and set the display order.</small>
        </div>
        <strong>{images.length} / {maxProjectImages}</strong>
      </div>

      <div
        className={`dropzone project-media-dropzone${dragOver ? " dragover" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => pickFiles()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            pickFiles();
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
          replaceIdRef.current = null;
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <span className="project-media-upload-mark" aria-hidden="true">+</span>
        <strong>{busy ? "Converting and uploading…" : "Add project photographs"}</strong>
        <small>JPG, PNG or WebP · automatically resized and stored as WebP</small>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedSourceImageExtensions}
        multiple
        hidden
        onChange={(event) => {
          void uploadFiles(Array.from(event.target.files || []));
          event.target.value = "";
        }}
      />

      {images.length > 0 && (
        <div className="project-media-grid">
          {images.map((image, index) => {
            const isHero = image.id === heroImageId;
            return (
              <article className={`project-media-card${isHero ? " is-hero" : ""}`} key={image.id}>
                <div className="project-media-preview">
                  <img src={image.image_url} alt="" />
                  <span className="project-media-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-media-source">
                    {image.storage_path ? "Supabase" : "Bundled"}
                  </span>
                  {isHero && <strong>Hero image</strong>}
                </div>
                <div className="project-media-card-body">
                  <label>
                    Image description *
                    <input
                      value={image.alt_text}
                      onChange={(event) => updateAlt(image.id, event.target.value)}
                      placeholder="Describe what is visible"
                      required
                    />
                  </label>
                  <div className="project-media-actions">
                    <button
                      type="button"
                      className={isHero ? "selected" : undefined}
                      aria-pressed={isHero}
                      onClick={() => setHeroImageId(image.id)}
                      disabled={busy}
                    >
                      {isHero ? "Selected hero" : "Make hero"}
                    </button>
                    <button
                      type="button"
                      aria-label={`Move image ${index + 1} earlier`}
                      onClick={() => moveImage(index, -1)}
                      disabled={busy || index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move image ${index + 1} later`}
                      onClick={() => moveImage(index, 1)}
                      disabled={busy || index === images.length - 1}
                    >
                      ↓
                    </button>
                    <button type="button" onClick={() => pickFiles(image.id)} disabled={busy}>
                      Replace
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => removeImage(image.id)}
                      disabled={busy}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {result && <p className="form-success">{result}</p>}
      {error && <p className="form-message">{error}</p>}
    </div>
  );
}
