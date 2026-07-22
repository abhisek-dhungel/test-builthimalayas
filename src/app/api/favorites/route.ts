import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet, dbRun } from "@/lib/database";
import { toPublicListing } from "@/lib/listings";
import { getCurrentUserId } from "@/lib/userAuth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await dbAll<Record<string, unknown>>(
    `SELECT l.*
     FROM favorites f
     JOIN listings l ON l.id = f.listing_id
     WHERE f.user_id = ? AND l.status IN ('active', 'taken')
     ORDER BY f.created_at DESC`,
    [userId],
  );

  return NextResponse.json(rows.map(toPublicListing));
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const listingId = Number(body.listing_id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
  }

  const listing = await dbGet<{ id: number }>(
    "SELECT id FROM listings WHERE id = ? AND status IN ('active', 'taken')",
    [listingId],
  );
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const existing = await dbGet<{ id: number }>(
    "SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?",
    [userId, listingId],
  );

  if (!existing) {
    await dbRun("INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)", [
      userId,
      listingId,
    ]);
  }

  return NextResponse.json({ success: true, favorited: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listingId = Number(searchParams.get("listing_id"));
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
  }

  await dbRun("DELETE FROM favorites WHERE user_id = ? AND listing_id = ?", [
    userId,
    listingId,
  ]);

  return NextResponse.json({ success: true, favorited: false });
}
