import { Suspense } from "react";
import { LogoFlipLoader } from "@/components/LogoFlipLoader";
import { SearchBrowse } from "@/components/SearchBrowse";
import { SiteHeader } from "@/components/SiteHeader";
import { getActiveListings } from "@/lib/listings";

// Render on request so DB queries run against the production database
// (matching /browse). Prerendering at build time would fail the deploy.
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  // Match the homepage: if the DB is unreachable (e.g. MySQL not configured
  // on the host), render the page with an empty result set instead of 500ing.
  let listings: Awaited<ReturnType<typeof getActiveListings>> = [];
  try {
    listings = await getActiveListings();
  } catch (error) {
    console.error("Search data load failed:", error);
  }

  return (
    <>
      <SiteHeader showBack />
      <Suspense fallback={<LogoFlipLoader label="Loading search" />}>
        <SearchBrowse listings={listings} />
      </Suspense>
    </>
  );
}
