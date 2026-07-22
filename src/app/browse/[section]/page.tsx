import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingGrid } from "@/components/ListingGrid";
import {
  getListingsForSection,
  getSectionTitle,
  type BrowseSection,
} from "@/lib/listings";
import { getDistrictLabel } from "@/lib/locations";

export const dynamic = "force-dynamic";

const VALID_SECTIONS: BrowseSection[] = [
  "featured",
  "kathmandu",
  "lalitpur",
  "bhaktapur",
];

type Props = { params: Promise<{ section: string }> };

export default async function BrowseSectionPage({ params }: Props) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section as BrowseSection)) {
    notFound();
  }

  const browseSection = section as BrowseSection;
  const listings = await getListingsForSection(browseSection);
  const title =
    browseSection === "featured"
      ? getSectionTitle(browseSection)
      : getDistrictLabel(browseSection);

  return (
    <>
      <SiteHeader showBack />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-6 pb-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <Link
              href="/browse"
              className="text-xs font-medium text-[var(--primary)]"
            >
              ← All rentals
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              No listings in this section yet.
            </p>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </main>
    </>
  );
}
