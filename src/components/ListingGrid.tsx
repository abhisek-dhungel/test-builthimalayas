import type { PublicListing } from "@/lib/types";
import { ListingCard } from "./ListingCard";

export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
