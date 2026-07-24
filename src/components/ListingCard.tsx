"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicListing } from "@/lib/types";
import {
  formatListingTitle,
  formatPrice,
  getPropertyTypeLabel,
} from "@/lib/property";
import { FavoriteButton } from "./FavoriteButton";
import { ParkingPills } from "./ParkingPills";
import { VisitModal } from "./VisitModal";

type ListingCardProps = {
  listing: PublicListing;
  layout?: "grid" | "desktop-grid";
};

export function ListingCard({ listing, layout = "grid" }: ListingCardProps) {
  const [showVisit, setShowVisit] = useState(false);
  const isDesktopGrid = layout === "desktop-grid";
  const isTaken = listing.status === "taken";

  return (
    <>
      <article className="listing-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <Link href={`/listing/${listing.id}`} className="block">
          <div
            className={`listing-card-image relative overflow-hidden bg-[var(--surface-muted)] aspect-[4/3] ${
              isDesktopGrid ? "lg:aspect-[5/4]" : ""
            }`}
          >
            {listing.image_path ? (
              <Image
                src={listing.image_path}
                alt={listing.landmark}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes={
                  isDesktopGrid
                    ? "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    : "(max-width: 768px) 50vw, 240px"
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-[var(--muted)] lg:text-5xl">
                🏠
              </div>
            )}
            {listing.featured === 1 && (
              <span className="absolute left-2 top-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white lg:px-2.5 lg:py-1 lg:text-xs">
                Featured
              </span>
            )}
            {isTaken && (
              <span className="absolute bottom-2 left-2 rounded-full bg-gray-800/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white lg:px-2.5 lg:py-1 lg:text-xs">
                Taken
              </span>
            )}
          </div>
        </Link>

        <div className={`p-3 ${isDesktopGrid ? "lg:p-4" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <Link href={`/listing/${listing.id}`} className="min-w-0">
              <span className="inline-block rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text)] lg:text-xs">
                {getPropertyTypeLabel(listing.property_type)}
              </span>
            </Link>
            <FavoriteButton listingId={listing.id} size="sm" />
          </div>
          <Link href={`/listing/${listing.id}`} className="block">
            <p className="mt-2 text-sm font-bold text-[var(--primary)] lg:text-base">
              {formatPrice(listing.price)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--text)] lg:text-base">
              {formatListingTitle(listing.property_details, listing.place)}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)] lg:text-sm">
              Near {listing.landmark}
            </p>
          </Link>
          <ParkingPills
            twoWheeler={listing.parking_two_wheeler}
            fourWheeler={listing.parking_four_wheeler}
          />
        </div>

        <div className={`px-3 pb-3 ${isDesktopGrid ? "lg:px-4 lg:pb-4" : ""}`}>
          {isTaken ? (
            <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] py-2.5 text-center text-sm font-semibold text-[var(--muted)] lg:py-3">
              Taken
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVisit(true)}
              className="w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] lg:py-3"
            >
              Book a Visit
            </button>
          )}
        </div>
      </article>

      {showVisit && (
        <VisitModal listing={listing} onClose={() => setShowVisit(false)} />
      )}
    </>
  );
}
