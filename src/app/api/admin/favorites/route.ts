import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbAll } from "@/lib/database";
import type { AppUser } from "@/lib/types";

export type AdminFavouriteListing = {
  id: number;
  place: string;
  landmark: string;
  property_type: string;
  property_details: string;
  price: number;
  status: string;
  image_path: string | null;
};

export type AdminUserFavourites = {
  user: AppUser;
  listings: AdminFavouriteListing[];
};

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await dbAll<{
    user_id: number;
    name: string;
    phone: string;
    address: string | null;
    blocked: number;
    user_created_at: string;
    listing_id: number;
    place: string;
    landmark: string;
    property_type: string;
    property_details: string;
    price: number;
    status: string;
    image_path: string | null;
  }>(
    `SELECT f.user_id,
            u.name, u.phone, u.address, u.blocked, u.created_at AS user_created_at,
            l.id AS listing_id, l.place, l.landmark, l.property_type,
            l.property_details, l.price, l.status, l.image_path
     FROM favorites f
     JOIN users u ON u.id = f.user_id
     JOIN listings l ON l.id = f.listing_id
     ORDER BY u.name, f.created_at DESC`,
  );

  const byUser = new Map<number, AdminUserFavourites>();

  for (const row of rows) {
    let group = byUser.get(row.user_id);
    if (!group) {
      group = {
        user: {
          id: row.user_id,
          name: row.name,
          phone: row.phone,
          address: row.address,
          blocked: row.blocked,
          created_at: row.user_created_at,
        },
        listings: [],
      };
      byUser.set(row.user_id, group);
    }
    group.listings.push({
      id: row.listing_id,
      place: row.place,
      landmark: row.landmark,
      property_type: row.property_type,
      property_details: row.property_details,
      price: row.price,
      status: row.status,
      image_path: row.image_path,
    });
  }

  return NextResponse.json(Array.from(byUser.values()));
}
