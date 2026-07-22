import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbAll } from "@/lib/database";
import type { VisitOrder } from "@/lib/types";

export async function GET(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await dbAll<VisitOrder>(
    `SELECT vo.*,
            l.district, l.place, l.landmark, l.name as listing_name,
            l.property_type, l.property_details, l.price, l.role as listing_role, l.image_path
     FROM visit_orders vo
     JOIN listings l ON l.id = vo.listing_id
     ${status === "new" ? "WHERE vo.status = 'new'" : ""}
     ORDER BY vo.created_at DESC`,
  );

  return NextResponse.json(orders);
}
