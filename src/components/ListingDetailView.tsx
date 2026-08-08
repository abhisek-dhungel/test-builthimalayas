"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PublicListing } from "@/lib/types";
import {
  formatListingTitle,
  formatPrice,
  getPropertyTypeLabel,
} from "@/lib/property";
import { FavoriteButton } from "./FavoriteButton";
import { ParkingPills } from "./ParkingPills";
import { VisitModal } from "./VisitModal";

export function ListingDetailView({ listing }: { listing: PublicListing }) {
  const [showVisit, setShowVisit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(
    listing.image_path ?? listing.image_paths[0] ?? null,
  );
  const isTaken = listing.status === "taken";

  const galleryImages = useMemo(() => {
    const paths = listing.image_paths.length
      ? listing.image_paths
      : listing.image_path
        ? [listing.image_path]
        : [];
    return paths;
  }, [listing.image_path, listing.image_paths]);

  const propertyUrl = (id: number) =>
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/listing/${id}`;

  const whatsappUrl = (id: number) => {
    const url = propertyUrl(id);
    const msg = `Hi, I'm interested in this property: ${url}`;
    return `https://wa.me/9779802373431?text=${encodeURIComponent(msg)}`;
  };

  async function handleShare(id: number) {
    const url = propertyUrl(id);
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (err) {
        if (err && (err as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(url)}`,
        "_blank",
        "noopener",
      );
    }
  }

  return (
    <>
      <div className="listing-detail grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="flex min-h-0 flex-col border-b border-[var(--border)] lg:border-b-0 lg:border-r">
          <div className="relative min-h-0 flex-1 bg-[var(--surface-muted)]">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={listing.landmark}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-[var(--muted)]">
                🏠
              </div>
            )}
            {listing.featured === 1 && (
              <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Featured
              </span>
            )}
            {isTaken && (
              <span className="absolute right-3 top-3 rounded-full bg-gray-800/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Taken
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <div className="flex gap-2 overflow-x-auto">
                {galleryImages.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setActiveImage(path)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 sm:h-14 sm:w-14 ${
                      activeImage === path
                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/35"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <Image
                      src={path}
                      alt="Property thumbnail"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <article className="flex min-h-0 flex-col p-4 sm:p-5 lg:p-6">
          <div className="flex shrink-0 items-start justify-between gap-3">
            <span className="inline-block rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
            <FavoriteButton listingId={listing.id} />
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
            <p className="text-xl font-bold text-[var(--primary)] lg:text-2xl">
              {formatPrice(listing.price)}
            </p>

            <h1 className="mt-1.5 text-lg font-semibold leading-snug text-[var(--text)] sm:text-xl lg:text-2xl">
              {formatListingTitle(listing.property_details, listing.place)}
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Near {listing.landmark}
            </p>

            <ParkingPills
              className="mt-2"
              size="md"
              twoWheeler={listing.parking_two_wheeler}
              fourWheeler={listing.parking_four_wheeler}
            />

            {listing.other_facilities && (
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Other facilities
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
                  {listing.other_facilities}
                </p>
              </div>
            )}

            {listing.video_path && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                <p className="border-b border-[var(--border)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Property video
                </p>
                <video
                  src={listing.video_path}
                  className="aspect-video w-full bg-black object-contain"
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            )}
          </div>

          <div className="mt-3 shrink-0 pt-1">
            {isTaken ? (
              <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-3 text-center text-sm font-semibold text-[var(--muted)]">
                Taken
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVisit(true)}
                  className="inline-flex min-w-[132px] flex-1 items-center justify-center rounded-xl bg-[var(--primary)] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-light)]"
                >
                  Book a Visit
                </button>

                <a
                  href={whatsappUrl(listing.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1eb857]"
                  aria-label="Share on WhatsApp"
                  title="WhatsApp"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h.01a7.94 7.94 0 0 0 5.54-13.58zM12.05 18.53h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.58 6.58 0 0 1 10.2-8.18 6.53 6.53 0 0 1 1.94 4.66 6.6 6.6 0 0 1-6.54 6.61zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.51.64-.63.77-.12.13-.23.15-.43.05a5.4 5.4 0 0 1-1.59-.98 6 6 0 0 1-1.1-1.37c-.12-.2 0-.31.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34h-.38c-.13 0-.35.05-.53.25s-.7.68-.7 1.66.72 1.93.82 2.06c.1.13 1.42 2.17 3.44 3.04.48.21.86.33 1.15.42.48.15.92.13 1.27.08.39-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                <a
                  href="tel:+9779802373431"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  aria-label="Call"
                  title="Call"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="hidden sm:inline">Call</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleShare(listing.id)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  aria-label="Share"
                  title="Share"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  <span className="hidden sm:inline">
                    {copied ? "Copied!" : "Share"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </article>
      </div>

      {showVisit && (
        <VisitModal listing={listing} onClose={() => setShowVisit(false)} />
      )}
    </>
  );
}
