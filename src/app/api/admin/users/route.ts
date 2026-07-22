import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbAll } from "@/lib/database";
import type { AppUser } from "@/lib/types";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await dbAll<AppUser>(
    `SELECT id, name, phone, address, blocked, created_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return NextResponse.json(users);
}
