import { HomeDesign } from "@/components/home/HomeDesign";
import { dbAll } from "@/lib/database";
import { getListingsForSection } from "@/lib/listings";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredListings, newsItems] = await Promise.all([
    getListingsForSection("featured"),
    dbAll<NewsItem>(
      `SELECT * FROM news
       WHERE status = 'active'
       ORDER BY created_at DESC`,
    ),
  ]);

  return (
    <HomeDesign featuredListings={featuredListings} newsItems={newsItems} />
  );
}
