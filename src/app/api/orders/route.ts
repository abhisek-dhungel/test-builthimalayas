import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun } from "@/lib/database";
import { isValidPhone } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id, name, phone } = body;

    if (!listing_id || !name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone.trim())) {
      return NextResponse.json(
        { error: "Enter a valid Nepal mobile number." },
        { status: 400 },
      );
    }

    const listing = await dbGet<{ id: number; status: string }>(
      "SELECT id, status FROM listings WHERE id = ?",
      [Number(listing_id)],
    );

    if (!listing || listing.status !== "active") {
      return NextResponse.json(
        { error: "Listing is not available." },
        { status: 404 },
      );
    }

    const result = await dbRun(
      "INSERT INTO visit_orders (listing_id, name, phone) VALUES (?, ?, ?)",
      [Number(listing_id), name.trim(), phone.trim()],
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit visit request." },
      { status: 500 },
    );
  }
}
