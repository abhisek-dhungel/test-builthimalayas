import { Suspense } from "react";
import { LogoFlipLoader } from "@/components/LogoFlipLoader";
import { SearchBrowse } from "@/components/SearchBrowse";
import { SiteHeader } from "@/components/SiteHeader";
import { getActiveListings } from "@/lib/listings";

export const revalidate = 60;

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
