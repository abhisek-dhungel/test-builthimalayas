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
import { FavoriteButton } from "../FavoriteButton";
import { ParkingPills } from "../ParkingPills";
import { VisitModal } from "../VisitModal";

export function VerifiedListingCard({ listing }: { listing: PublicListing }) {
  const [showVisit, setShowVisit] = useState(false);
  const isTaken = listing.status === "taken";

  return (
    <>
      <article className="listing-card">
        <Link href={`/listing/${listing.id}`} className="listing-photo">
          {listing.image_path ? (
            <Image
              src={listing.image_path}
              alt={formatListingTitle(listing.property_details, listing.place)}
              fill
              className="object-cover"
              sizes="(max-width: 560px) 100vw, (max-width: 1080px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center text-4xl text-[var(--hd-text-muted)]">
              🏠
            </div>
          )}
          {listing.featured === 1 && (
            <span className="badge-featured">Featured</span>
          )}
        </Link>

        <div className="listing-body">
          <div className="listing-top-row">
            <span className="tag-pill">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
            <FavoriteButton listingId={listing.id} size="sm" />
          </div>
          <div className="listing-price">{formatPrice(listing.price)}</div>
          <Link href={`/listing/${listing.id}`} className="listing-name">
            {formatListingTitle(listing.property_details, listing.place)}
          </Link>
          <div className="listing-meta">
            Near {listing.landmark}
          </div>
          <ParkingPills
            twoWheeler={listing.parking_two_wheeler}
            fourWheeler={listing.parking_four_wheeler}
          />
          {isTaken ? (
            <button type="button" className="btn-visit" disabled>
              Taken
            </button>
          ) : (
            <button
              type="button"
              className="btn-visit"
              onClick={() => setShowVisit(true)}
            >
              I want to visit
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
