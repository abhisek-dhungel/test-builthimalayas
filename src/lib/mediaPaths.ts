/** Accepted media paths: local /uploads/... or Cloudinary HTTPS URLs. */

export function isCloudinaryUrl(path: string): boolean {
  try {
    const url = new URL(path);
    return (
      url.protocol === "https:" &&
      (url.hostname === "res.cloudinary.com" ||
        url.hostname.endsWith(".cloudinary.com"))
    );
  } catch {
    return false;
  }
}

export function isMediaPath(path: unknown): path is string {
  if (typeof path !== "string" || !path.trim()) return false;
  if (path.startsWith("/uploads/")) return true;
  return isCloudinaryUrl(path);
}
