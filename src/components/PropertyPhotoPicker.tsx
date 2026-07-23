"use client";

import { useRef } from "react";

export type ListingPhoto = {
  path: string;
  preview: string;
};

type PropertyPhotoPickerProps = {
  photos: ListingPhoto[];
  displayIndex: number;
  uploading: boolean;
  onPhotosChange: (photos: ListingPhoto[]) => void;
  onDisplayIndexChange: (index: number) => void;
  onUpload: (file: File) => Promise<string | null>;
  onError: (message: string) => void;
  className?: string;
  variant?: "default" | "glass";
};

const MAX_PHOTOS = 5;

export function PropertyPhotoPicker({
  photos,
  displayIndex,
  uploading,
  onPhotosChange,
  onDisplayIndexChange,
  onUpload,
  onError,
  className = "",
  variant = "default",
}: PropertyPhotoPickerProps) {
  const isGlass = variant === "glass";
  const atLimit = photos.length >= MAX_PHOTOS;
  const modeBtnClass = isGlass
    ? "photo-picker-mode-btn"
    : "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--primary)] disabled:opacity-50";
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file || photos.length >= MAX_PHOTOS) return;

    const path = await onUpload(file);
    if (!path) return;

    const preview = URL.createObjectURL(file);
    onPhotosChange([...photos, { path, preview }]);
  }

  function openCamera() {
    if (atLimit) {
      onError("You can add up to 5 photos.");
      return;
    }
    cameraInputRef.current?.click();
  }

  function openUpload() {
    if (atLimit) {
      onError("You can add up to 5 photos.");
      return;
    }
    uploadInputRef.current?.click();
  }

  function removePhoto(index: number) {
    const next = photos.filter((_, i) => i !== index);
    onPhotosChange(next);
    if (displayIndex >= next.length) {
      onDisplayIndexChange(Math.max(0, next.length - 1));
    } else if (index < displayIndex) {
      onDisplayIndexChange(displayIndex - 1);
    }
  }

  const slots = Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null);

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openCamera}
          disabled={uploading || atLimit}
          className={modeBtnClass}
        >
          Camera
        </button>
        <button
          type="button"
          onClick={openUpload}
          disabled={uploading || atLimit}
          className={modeBtnClass}
        >
          Upload
        </button>
      </div>

      <p
        className={
          isGlass
            ? "photo-picker-hint"
            : "text-[10px] text-[var(--muted)]"
        }
      >
        Add up to 5 photos. Tap a photo to mark it as Show.
      </p>

      <div className="grid grid-cols-5 gap-2">
        {slots.map((photo, index) => {
          if (photo) {
            const isDisplay = index === displayIndex;
            return (
              <div
                key={photo.path}
                className={
                  isGlass
                    ? `photo-picker-slot${isDisplay ? " is-display" : ""}`
                    : `relative aspect-square overflow-hidden rounded-xl border-2 ${
                        isDisplay
                          ? "border-[var(--accent)]"
                          : "border-[var(--border)]"
                      }`
                }
              >
                <button
                  type="button"
                  onClick={() => onDisplayIndexChange(index)}
                  className="h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt={`Property photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
                {isDisplay && (
                  <span className="absolute bottom-1 left-1 right-1 rounded bg-black/70 px-1 py-0.5 text-center text-[8px] font-semibold uppercase tracking-wide text-white">
                    Show
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            );
          }

          return (
            <div
              key={`empty-${index}`}
              className={
                isGlass
                  ? "photo-picker-empty"
                  : "aspect-square rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] opacity-40"
              }
            />
          );
        })}
      </div>

      {uploading && (
        <p className={isGlass ? "photo-picker-status" : "text-xs text-[var(--muted)]"}>
          Uploading photo...
        </p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
