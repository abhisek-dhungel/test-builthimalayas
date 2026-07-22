"use client";

import { useRef } from "react";

export type ListingVideo = {
  path: string;
  preview: string;
};

type PropertyVideoPickerProps = {
  video: ListingVideo | null;
  uploading: boolean;
  onVideoChange: (video: ListingVideo | null) => void;
  onUpload: (file: File) => Promise<string | null>;
  onError: (message: string) => void;
  className?: string;
  variant?: "default" | "glass";
};

export function PropertyVideoPicker({
  video,
  uploading,
  onVideoChange,
  onUpload,
  onError,
  className = "",
  variant = "default",
}: PropertyVideoPickerProps) {
  const isGlass = variant === "glass";
  const modeBtnClass = isGlass
    ? "photo-picker-mode-btn"
    : "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--primary)] disabled:opacity-50";
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      onError("Please choose a video file.");
      return;
    }

    const path = await onUpload(file);
    if (!path) return;

    if (video?.preview) URL.revokeObjectURL(video.preview);
    const preview = URL.createObjectURL(file);
    onVideoChange({ path, preview });
  }

  function openCamera() {
    cameraInputRef.current?.click();
  }

  function openUpload() {
    uploadInputRef.current?.click();
  }

  function removeVideo() {
    if (video?.preview) URL.revokeObjectURL(video.preview);
    onVideoChange(null);
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openCamera}
          disabled={uploading}
          className={modeBtnClass}
        >
          Camera
        </button>
        <button
          type="button"
          onClick={openUpload}
          disabled={uploading}
          className={modeBtnClass}
        >
          Upload
        </button>
      </div>

      {video && (
        <div
          className={
            isGlass
              ? "video-picker-preview"
              : "relative overflow-hidden rounded-xl border border-[var(--border)] bg-black"
          }
        >
          <video
            src={video.preview}
            className="aspect-video w-full object-contain"
            controls
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white"
            aria-label="Remove video"
          >
            ×
          </button>
        </div>
      )}

      {uploading && (
        <p className={isGlass ? "photo-picker-status" : "text-xs text-[var(--muted)]"}>
          Uploading video...
        </p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
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
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
