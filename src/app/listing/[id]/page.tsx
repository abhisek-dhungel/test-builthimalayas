import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingDetailView } from "@/components/ListingDetailView";
import { getActiveListingById } from "@/lib/listings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getActiveListingById(Number(id));

  if (!listing) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader showBack />
      <main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-1 flex-col px-3 py-2 sm:px-4 sm:py-3 lg:px-6 xl:max-w-[1400px]">
        <ListingDetailView listing={listing} />
      </main>
    </div>
  );
}
