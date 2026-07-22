import { dbAll, dbGet } from "./database";
import {
  getDisplayImagePath,
  parseImagePaths,
} from "./images";
import type { PropertyType } from "./property";
import type { Listing, PublicListing } from "./types";

export function normalizeListing(row: Record<string, unknown>): Listing {
  const propertyType = row.property_type as PropertyType | undefined;
  const price = row.price;
  const parsedPrice = typeof price === "number" ? price : Number(price);
  const rawStatus = String(row.status ?? "pending");
  const status =
    rawStatus === "sold" ? "taken" : (rawStatus as Listing["status"]);
  const image_paths = parseImagePaths(
    row.image_paths,
    row.image_path as string | null,
  );
  const image_path =
    (row.image_path as string | null) ??
    getDisplayImagePath(image_paths, 0);

  return {
    ...(row as unknown as Listing),
    property_type:
      propertyType === "room" ||
      propertyType === "flat" ||
      propertyType === "commercial"
        ? propertyType
        : "flat",
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    property_details: String(row.property_details ?? "").trim(),
    parking_two_wheeler: Number(row.parking_two_wheeler) || 0,
    parking_four_wheeler: Number(row.parking_four_wheeler) || 0,
    other_facilities: String(row.other_facilities ?? "").trim(),
    featured: Number(row.featured) || 0,
    status,
    image_paths,
    image_path,
    video_path: (row.video_path as string | null) || null,
  };
}

export function toPublicListing(
  listing: Listing | Record<string, unknown>,
): PublicListing {
  const normalized = normalizeListing(listing as Record<string, unknown>);
  const { role, name, phone, ...publicListing } = normalized;
  return publicListing;
}

export function toPublicListingCard(
  listing: Listing | Record<string, unknown>,
): PublicListing {
  const normalized = normalizeListing(listing as Record<string, unknown>);
  const {
    role,
    name,
    phone,
    image_paths,
    other_facilities,
    video_path,
    ...publicListing
  } = normalized;
  return {
    ...publicListing,
    image_paths: [],
    other_facilities: "",
    video_path: null,
  };
}

const PUBLIC_LISTING_STATUSES = "('active', 'taken')";

const LISTING_CARD_COLUMNS = `
  id, district, place, landmark, property_type, property_details, price,
  parking_two_wheeler, parking_four_wheeler, image_path, status, featured, created_at
`;

export async function getActiveListings(): Promise<PublicListing[]> {
  const listings = await dbAll<Record<string, unknown>>(
    `SELECT ${LISTING_CARD_COLUMNS} FROM listings
     WHERE status IN ${PUBLIC_LISTING_STATUSES}
     ORDER BY
       CASE status WHEN 'active' THEN 0 ELSE 1 END,
       featured DESC,
       created_at DESC
     LIMIT 200`,
  );

  return listings.map((row) => toPublicListingCard(row));
}

export async function getActiveListingById(
  id: number,
): Promise<PublicListing | null> {
  const listing = await dbGet<Record<string, unknown>>(
    `SELECT * FROM listings WHERE id = ? AND status IN ${PUBLIC_LISTING_STATUSES}`,
    [id],
  );

  return listing ? toPublicListing(listing) : null;
}

export type BrowseSection = "featured" | "kathmandu" | "lalitpur" | "bhaktapur";

export async function getListingsForSection(
  section: BrowseSection,
): Promise<PublicListing[]> {
  if (section === "featured") {
    const listings = await dbAll<Record<string, unknown>>(
      `SELECT ${LISTING_CARD_COLUMNS} FROM listings
       WHERE status IN ${PUBLIC_LISTING_STATUSES} AND featured = 1
       ORDER BY created_at DESC
       LIMIT 24`,
    );
    return listings.map((row) => toPublicListingCard(row));
  }

  const listings = await dbAll<Record<string, unknown>>(
    `SELECT ${LISTING_CARD_COLUMNS} FROM listings
     WHERE status IN ${PUBLIC_LISTING_STATUSES}
       AND featured = 0
       AND district = ?
     ORDER BY
       CASE status WHEN 'active' THEN 0 ELSE 1 END,
       created_at DESC
     LIMIT 48`,
    [section],
  );
  return listings.map((row) => toPublicListingCard(row));
}

export function getSectionTitle(section: BrowseSection): string {
  const titles: Record<BrowseSection, string> = {
    featured: "Featured",
    kathmandu: "Kathmandu",
    lalitpur: "Lalitpur",
    bhaktapur: "Bhaktapur",
  };
  return titles[section];
}

export async function getAllListings(): Promise<Listing[]> {
  const listings = await dbAll<Record<string, unknown>>(
    `SELECT * FROM listings
     ORDER BY
       CASE status
         WHEN 'pending' THEN 0
         WHEN 'active' THEN 1
         WHEN 'stopped' THEN 2
         WHEN 'taken' THEN 3
         ELSE 4
       END,
       created_at DESC`,
  );

  return listings.map(normalizeListing);
}

export async function getListingsByPhone(phone: string): Promise<Listing[]> {
  const cleaned = phone.trim().replace(/\s+/g, "");
  const listings = await dbAll<Record<string, unknown>>(
    `SELECT * FROM listings
     WHERE REPLACE(phone, ' ', '') = ?
     ORDER BY created_at DESC`,
    [cleaned],
  );

  return listings.map(normalizeListing);
}
