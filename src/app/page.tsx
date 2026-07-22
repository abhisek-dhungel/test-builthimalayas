import { HomeDesign } from "@/components/home/HomeDesign";
import { dbAll } from "@/lib/database";
import { getListingsForSection } from "@/lib/listings";
import type { NewsItem, PublicListing } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  let featuredListings: PublicListing[] = [];
  let newsItems: NewsItem[] = [];

  try {
    [featuredListings, newsItems] = await Promise.all([
      getListingsForSection("featured"),
      dbAll<NewsItem>(
        `SELECT id, heading, body, image_path, status, created_at FROM news
         WHERE status = 'active'
         ORDER BY created_at DESC
         LIMIT 12`,
      ),
    ]);
  } catch (error) {
    console.error("HomePage data load failed:", error);
  }

  return (
    <HomeDesign featuredListings={featuredListings} newsItems={newsItems} />
  );
}
