import { NextResponse } from "next/server";
import { dbAll } from "@/lib/database";
import type { NewsItem } from "@/lib/types";

export async function GET() {
  try {
    const items = await dbAll<NewsItem>(
      `SELECT * FROM news
       WHERE status = 'active'
       ORDER BY created_at DESC`,
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error("Public news list failed:", error);
    return NextResponse.json(
      { error: "Could not load news." },
      { status: 500 },
    );
  }
}
