import type { SupabaseClient } from "@supabase/supabase-js";

export const acceptedSourceImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const acceptedSourceImageExtensions = ".jpg,.jpeg,.png,.webp";
export const maxSourceImageBytes = 20 * 1024 * 1024;
const maxStoredImageBytes = 5 * 1024 * 1024;

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export type UploadedWebp = {
  url: string;
  path: string;
  originalBytes: number;
  storedBytes: number;
  width: number;
  height: number;
};

function decodeWithImageElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        close: () => URL.revokeObjectURL(objectUrl),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The browser could not read this image."));
    };
    image.src = objectUrl;
  });
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  return decodeWithImageElement(file);
}

async function encodeWebp(
  file: File,
  maxDimension: number,
  quality: number,
) {
  const decoded = await decodeImage(file);

  try {
    if (
      decoded.width < 1 ||
      decoded.height < 1 ||
      decoded.width * decoded.height > 50_000_000
    ) {
      throw new Error("Use an image smaller than 50 megapixels.");
    }
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image conversion is unavailable in this browser.");
    context.drawImage(decoded.source, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result || result.type !== "image/webp") {
            reject(new Error("This browser cannot create WebP images."));
            return;
          }
          resolve(result);
        },
        "image/webp",
        quality,
      );
    });

    return { blob, width, height };
  } finally {
    decoded.close();
  }
}

export async function convertImageToWebp(file: File) {
  if (!acceptedSourceImageTypes.includes(file.type)) {
    throw new Error("Use a JPG, PNG or WebP image.");
  }
  if (file.size < 1) throw new Error("The selected image is empty.");
  if (file.size > maxSourceImageBytes) {
    throw new Error("The source image must be 20 MB or smaller.");
  }

  let converted = await encodeWebp(file, 2560, 0.82);
  if (converted.blob.size > maxStoredImageBytes) {
    converted = await encodeWebp(file, 2000, 0.72);
  }
  if (converted.blob.size > maxStoredImageBytes) {
    throw new Error("The converted WebP is still larger than 5 MB. Use a smaller image.");
  }

  return converted;
}

export async function uploadWebpImage({
  supabase,
  bucket,
  folder,
  file,
}: {
  supabase: SupabaseClient;
  bucket: string;
  folder: string;
  file: File;
}): Promise<UploadedWebp> {
  const converted = await convertImageToWebp(file);
  const safeFolder = folder
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");
  const path = `${safeFolder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, converted.blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    originalBytes: file.size,
    storedBytes: converted.blob.size,
    width: converted.width,
    height: converted.height,
  };
}

export function imageAltFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
