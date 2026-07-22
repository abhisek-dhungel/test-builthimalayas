import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/userAuth";

export async function POST() {
  await logoutUser();
  return NextResponse.json({ success: true });
}
