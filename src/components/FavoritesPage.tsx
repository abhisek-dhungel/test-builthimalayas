"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicListing } from "@/lib/types";
import { SiteHeader } from "./SiteHeader";
import { ListingCard } from "./ListingCard";

export function FavoritesPage() {
  const router = useRouter();
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/favorites", { credentials: "same-origin" });
      if (res.status === 401) {
        router.replace("/login?next=/favorites");
        return;
      }
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [router]);

  return (
    <>
      <SiteHeader showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-10 lg:max-w-7xl lg:px-8">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Favourites</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Listings you saved for later.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[var(--muted)]">Loading...</p>
        ) : listings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              No favourites yet. Tap the bookmark on a listing to save it.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} layout="desktop-grid" />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
