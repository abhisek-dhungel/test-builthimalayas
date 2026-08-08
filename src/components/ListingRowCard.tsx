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
  const [copied, setCopied] = useState(false);
  const isTaken = listing.status === "taken";

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
              <a
                href={whatsappUrl(listing.id)}
                target="_blank"
                rel="noreferrer"
                className="search-row-btn search-row-btn-wa"
                aria-label="Share on WhatsApp"
                title="WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h.01a7.94 7.94 0 0 0 5.54-13.58zM12.05 18.53h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.58 6.58 0 0 1 10.2-8.18 6.53 6.53 0 0 1 1.94 4.66 6.6 6.6 0 0 1-6.54 6.61zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.51.64-.63.77-.12.13-.23.15-.43.05a5.4 5.4 0 0 1-1.59-.98 6 6 0 0 1-1.1-1.37c-.12-.2 0-.31.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34h-.38c-.13 0-.35.05-.53.25s-.7.68-.7 1.66.72 1.93.82 2.06c.1.13 1.42 2.17 3.44 3.04.48.21.86.33 1.15.42.48.15.92.13 1.27.08.39-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z" />
                </svg>
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => handleShare(listing.id)}
                className="search-row-btn search-row-btn-ghost"
                aria-label="Share"
                title="Share"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
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
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
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
