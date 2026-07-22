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
              <button
                type="button"
                onClick={() => setShowVisit(true)}
                className="w-full rounded-xl bg-[var(--primary)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-light)] lg:py-4 lg:text-base"
              >
                I want to visit
              </button>
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
