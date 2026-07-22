import { Suspense } from "react";
import { SearchBrowse } from "@/components/SearchBrowse";
import { SiteHeader } from "@/components/SiteHeader";
import { getActiveListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const listings = await getActiveListings();

  return (
    <>
      <SiteHeader showBack />
      <Suspense
        fallback={
          <main className="search-browse flex-1">
            <div className="search-browse-inner">
              <p className="text-sm text-[var(--muted)]">Loading search…</p>
            </div>
          </main>
        }
      >
        <SearchBrowse listings={listings} />
      </Suspense>
    </>
  );
}
