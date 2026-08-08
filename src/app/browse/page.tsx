import { SiteHeader } from "@/components/SiteHeader";
import { BrowsePageShell } from "@/components/BrowsePageShell";
import { ListingSection } from "@/components/ListingSection";
import {
  getActiveListings,
  getListingsForSection,
  getSectionTitle,
} from "@/lib/listings";
import { getDistrictLabel } from "@/lib/locations";

export const dynamic = "force-dynamic";

const SECTIONS = ["featured", "kathmandu"] as const;

export default async function BrowsePage() {
  // Render with an empty result set if the DB is unreachable, rather than
  // crashing the page (matching the homepage + search resilience).
  let listings: Awaited<ReturnType<typeof getActiveListings>> = [];
  let featured: Awaited<ReturnType<typeof getListingsForSection>> = [];
  let kathmandu: Awaited<ReturnType<typeof getListingsForSection>> = [];

  try {
    [listings, featured, kathmandu] = await Promise.all([
      getActiveListings(),
      getListingsForSection("featured"),
      getListingsForSection("kathmandu"),
    ]);
  } catch (error) {
    console.error("Browse data load failed:", error);
  }

  const sectionData = {
    featured,
    kathmandu,
  };

  const hasListings = listings.length > 0;

  return (
    <>
      <SiteHeader showBack />
      <BrowsePageShell>
        {!hasListings ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              No active listings yet. Check back soon or list your property.
            </p>
          </div>
        ) : (
          <>
            {SECTIONS.map((section, index) => (
              <ListingSection
                key={section}
                title={
                  section === "featured"
                    ? getSectionTitle(section)
                    : getDistrictLabel(section)
                }
                listings={sectionData[section]}
                viewAllHref={`/browse/${section}`}
                layout="desktop-grid"
                revealDelay={index * 100}
              />
            ))}
          </>
        )}
      </BrowsePageShell>
    </>
  );
}
