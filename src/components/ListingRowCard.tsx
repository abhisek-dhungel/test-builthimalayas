"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicListing } from "@/lib/types";
import { getDistrictLabel } from "@/lib/locations";
import {
  formatListingTitle,
  formatPrice,
  getPropertyTypeLabel,
} from "@/lib/property";
import { FavoriteButton } from "./FavoriteButton";
import { ParkingPills } from "./ParkingPills";
import { VisitModal } from "./VisitModal";

type ListingRowCardProps = {
  listing: PublicListing;
};

export function ListingRowCard({ listing }: ListingRowCardProps) {
  const [showVisit, setShowVisit] = useState(false);
  const isTaken = listing.status === "taken";

  return (
    <>
      <article className="search-row">
        <div className="search-row-inner">
          <Link href={`/listing/${listing.id}`} className="search-row-photo">
            <div className="search-row-photo-frame">
              {listing.image_path ? (
                <Image
                  src={listing.image_path}
                  alt={listing.landmark}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 300px"
                />
              ) : (
                <div className="flex h-full min-h-[180px] items-center justify-center text-4xl text-[var(--muted)]">
                  🏠
                </div>
              )}
              {listing.featured === 1 && (
                <span className="search-row-badge">Verified</span>
              )}
              {isTaken && (
                <span className="search-row-badge is-taken">Taken</span>
              )}
            </div>
          </Link>

          <div className="search-row-body">
            <div className="search-row-top">
              <span className="search-row-type">
                {getPropertyTypeLabel(listing.property_type)}
              </span>
              <FavoriteButton listingId={listing.id} size="sm" />
            </div>

            <Link href={`/listing/${listing.id}`} className="block">
              <p className="search-row-price">{formatPrice(listing.price)}</p>
              <h3 className="search-row-title">
                {formatListingTitle(listing.property_details, listing.place)}
              </h3>
              <p className="search-row-meta">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>
                  {listing.place}, {getDistrictLabel(listing.district)} · Near{" "}
                  {listing.landmark}
                </span>
              </p>
            </Link>
            <ParkingPills
              className="search-row-parking"
              twoWheeler={listing.parking_two_wheeler}
              fourWheeler={listing.parking_four_wheeler}
            />

            <div className="search-row-actions">
              {!isTaken ? (
                <button
                  type="button"
                  onClick={() => setShowVisit(true)}
                  className="search-row-btn search-row-btn-ghost"
                >
                  Visit
                </button>
              ) : null}
              <Link
                href={`/listing/${listing.id}`}
                className="search-row-btn search-row-btn-solid"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </article>

      {showVisit && (
        <VisitModal listing={listing} onClose={() => setShowVisit(false)} />
      )}
    </>
  );
}
