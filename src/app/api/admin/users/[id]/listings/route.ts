import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet } from "@/lib/database";
import { getListingsByPhone } from "@/lib/listings";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const user = await dbGet<{ phone: string }>(
    "SELECT phone FROM users WHERE id = ?",
    [userId],
  );
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const listings = await getListingsByPhone(user.phone);
  return NextResponse.json(listings);
}
