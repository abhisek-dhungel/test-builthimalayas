const MAX_LISTING_PHOTOS = 4;

export function parseImagePaths(
  value: unknown,
  fallbackPath?: string | null,
): string[] {
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((path): path is string => typeof path === "string" && !!path)
          .slice(0, MAX_LISTING_PHOTOS);
      }
    } catch {
      // Fall through to legacy single-image field.
    }
  }

  if (fallbackPath) return [fallbackPath];
  return [];
}

export function serializeImagePaths(paths: string[]): string | null {
  const cleaned = paths
    .filter((path) => typeof path === "string" && path.trim())
    .slice(0, MAX_LISTING_PHOTOS);
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

export function getDisplayImagePath(
  paths: string[],
  displayIndex = 0,
): string | null {
  if (paths.length === 0) return null;
  const index = Math.min(Math.max(displayIndex, 0), paths.length - 1);
  return paths[index] ?? paths[0] ?? null;
}

export function getGalleryPaths(
  paths: string[],
  displayPath: string | null,
): string[] {
  if (paths.length === 0) return [];
  if (!displayPath) return paths;
  const others = paths.filter((path) => path !== displayPath);
  return [displayPath, ...others];
}

export function isValidImagePaths(paths: unknown): paths is string[] {
  if (!Array.isArray(paths)) return false;
  if (paths.length > MAX_LISTING_PHOTOS) return false;
  return paths.every(
    (path) => typeof path === "string" && path.startsWith("/uploads/"),
  );
}

export const MAX_LISTING_PHOTO_COUNT = MAX_LISTING_PHOTOS;

export function isValidVideoPath(path: unknown): path is string {
  return typeof path === "string" && path.startsWith("/uploads/");
}
