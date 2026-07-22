/**
 * Upload image/video for listings & news.
 * - With Cloudinary env (Vercel): browser uploads directly (supports large videos).
 * - Without: falls back to /api/upload (local disk).
 */

export type UploadedMedia = {
  path: string;
  kind: "image" | "video";
};

function cloudinaryConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim(),
  );
}

export async function uploadMediaFile(file: File): Promise<UploadedMedia | null> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isImage && !isVideo) {
    throw new Error("Only image or video files are allowed.");
  }

  if (cloudinaryConfigured()) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!.trim();
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!.trim();
    const resourceType = isVideo ? "video" : "image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("folder", "builthimalayas");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
      { method: "POST", body: formData },
    );
    const data = (await res.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
    return { path: data.secure_url, kind: resourceType };
  }

  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = (await res.json()) as {
    path?: string;
    kind?: string;
    error?: string;
  };
  if (!res.ok || !data.path) {
    throw new Error(data.error || "Upload failed");
  }
  return {
    path: data.path,
    kind: data.kind === "video" ? "video" : "image",
  };
}
