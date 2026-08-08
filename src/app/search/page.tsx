import { Suspense } from "react";
import { LogoFlipLoader } from "@/components/LogoFlipLoader";
import { SearchBrowse } from "@/components/SearchBrowse";
import { SiteHeader } from "@/components/SiteHeader";
import { getActiveListings } from "@/lib/listings";

// Render on request so DB queries run against the production database
// (matching /browse). Prerendering at build time would fail the deploy.
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const listings = await getActiveListings();

  return (
    <>
      <SiteHeader showBack />
      <Suspense fallback={<LogoFlipLoader label="Loading search" />}>
        <SearchBrowse listings={listings} />
      </Suspense>
    </>
  );
}
