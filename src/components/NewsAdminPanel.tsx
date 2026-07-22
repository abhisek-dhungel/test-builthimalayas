"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { newsBodyPreview } from "@/lib/newsBody";

type NewsAdminPanelProps = {
  items: NewsItem[];
  onChanged: () => void;
  onError: (message: string) => void;
};

export function NewsAdminPanel({
  items,
  onChanged,
  onError,
}: NewsAdminPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setHeading("");
    setBody("");
    setImagePath(null);
    setShowForm(false);
  }

  function startCreate() {
    setEditingId(null);
    setHeading("");
    setBody("");
    setImagePath(null);
    setShowForm(true);
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id);
    setHeading(item.heading ?? "");
    setBody(item.body);
    setImagePath(item.image_path);
    setShowForm(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    onError("");
    try {
      const { uploadMediaFile } = await import("@/lib/uploadMedia");
      const result = await uploadMediaFile(file);
      if (!result?.path) {
        onError("Image upload failed.");
        return;
      }
      setImagePath(result.path);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = heading.trim();
    const text = body.trim();
    if (!title) {
      onError("News heading is required.");
      return;
    }
    if (!text) {
      onError("News text is required.");
      return;
    }

    setSaving(true);
    onError("");
    try {
      if (editingId == null) {
        const res = await fetch("/api/admin/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            heading: title,
            body: text,
            image_path: imagePath,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError(data.error || "Could not create news.");
          return;
        }
      } else {
        const res = await fetch(`/api/admin/news/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            action: "update",
            heading: title,
            body: text,
            image_path: imagePath,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError(data.error || "Could not update news.");
          return;
        }
      }
      resetForm();
      onChanged();
    } catch {
      onError("Could not save news.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(id: number, action: string) {
    onError("");
    const res = await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json();
      onError(data.error || "Action failed.");
      return;
    }
    if (editingId === id) resetForm();
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">
          {items.length} news post{items.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => (showForm && editingId == null ? resetForm() : startCreate())}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          {showForm && editingId == null ? "Cancel" : "Add news"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {editingId == null ? "New news post" : "Edit news post"}
          </h2>

          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Display image
              </label>
              <div className="flex flex-wrap items-start gap-3">
                <div className="relative h-28 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                  {imagePath ? (
                    <Image
                      src={imagePath}
                      alt="News preview"
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-medium">
                    {uploading ? "Uploading…" : "Choose image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading || saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {imagePath && (
                    <button
                      type="button"
                      onClick={() => setImagePath(null)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="news-heading"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
              >
                Heading (bold)
              </label>
              <input
                id="news-heading"
                required
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="field-input font-bold"
                placeholder="News heading…"
              />
            </div>

            <div>
              <label
                htmlFor="news-body"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
              >
                News text
              </label>
              <textarea
                id="news-body"
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="field-input min-h-[160px] resize-y font-mono text-sm"
                placeholder={`Write the news…

## Subheading in the middle
More text under that subheading…`}
              />
              <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                Tip: start a line with{" "}
                <code className="rounded bg-[var(--surface-muted)] px-1 font-semibold">
                  ##
                </code>{" "}
                to make a bold subheading in the middle of the text.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Submit"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]">
                {item.image_path ? (
                  <Image
                    src={item.image_path}
                    alt="News"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      item.status === "active"
                        ? "bg-[#e8eef3] text-[#153350]"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
                {item.heading ? (
                  <p className="mt-2 line-clamp-1 text-sm font-bold text-[var(--text)]">
                    {item.heading}
                  </p>
                ) : null}
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {newsBodyPreview(item.body)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium"
              >
                Edit
              </button>
              {item.status === "active" ? (
                <button
                  type="button"
                  onClick={() => handleAction(item.id, "stop")}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(item.id, "activate")}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Activate
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this news post?")) {
                    handleAction(item.id, "delete");
                  }
                }}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No news posts yet.</p>
        )}
      </div>
    </div>
  );
}
