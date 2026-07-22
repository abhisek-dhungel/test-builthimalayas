"use client";

import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { ScrollReveal } from "./ScrollReveal";

export function ListingSection({
  title,
  listings,
  limit = 4,
  viewAllHref,
  layout = "grid",
  revealDelay = 0,
}: {
  title: string;
  listings: PublicListing[];
  limit?: number;
  viewAllHref?: string;
  layout?: "grid" | "desktop-grid";
  revealDelay?: number;
}) {
  if (listings.length === 0) return null;

  const visible = listings.slice(0, limit);
  const hasMore = listings.length > limit;
  const isDesktopGrid = layout === "desktop-grid";

  return (
    <ScrollReveal delay={revealDelay}>
      <section className={`mb-8 ${isDesktopGrid ? "lg:mb-10" : ""}`}>
        <div className="mb-3 flex items-end justify-between gap-2 lg:mb-4">
          <h2
            className={`section-title-accent font-semibold text-[var(--text)] ${
              isDesktopGrid ? "text-base lg:text-xl" : "text-base"
            }`}
          >
            {title}
          </h2>
          {hasMore && viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-medium text-[var(--primary)] transition hover:translate-x-0.5 lg:text-sm"
            >
              View all ({listings.length})
            </Link>
          )}
        </div>

        <div
          className={
            isDesktopGrid
              ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-5"
              : "grid grid-cols-2 gap-3 sm:gap-4"
          }
        >
          {visible.map((listing, index) => (
            <div
              key={listing.id}
              className="listing-card-wrap"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ListingCard listing={listing} layout={layout} />
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
