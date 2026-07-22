import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/database";
import { getCurrentUserId } from "@/lib/userAuth";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ ids: [] });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) {
    const rows = await dbAll<{ listing_id: number }>(
      "SELECT listing_id FROM favorites WHERE user_id = ?",
      [userId],
    );
    return NextResponse.json({ ids: rows.map((r) => r.listing_id) });
  }

  const ids = idsParam
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id));

  if (ids.length === 0) {
    return NextResponse.json({ ids: [] });
  }

  const placeholders = ids.map(() => "?").join(",");
  const rows = await dbAll<{ listing_id: number }>(
    `SELECT listing_id FROM favorites
     WHERE user_id = ? AND listing_id IN (${placeholders})`,
    [userId, ...ids],
  );

  return NextResponse.json({ ids: rows.map((r) => r.listing_id) });
}
