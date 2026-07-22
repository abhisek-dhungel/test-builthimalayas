import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbAll } from "@/lib/database";
import type { CustomOrder } from "@/lib/types";

export async function GET(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await dbAll<CustomOrder>(
    `SELECT * FROM custom_orders
     ${status === "new" ? "WHERE status = 'new'" : ""}
     ORDER BY created_at DESC`,
  );

  return NextResponse.json(orders);
}
