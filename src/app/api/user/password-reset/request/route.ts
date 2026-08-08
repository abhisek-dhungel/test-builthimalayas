import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/userAuth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    await requestPasswordReset(String(email ?? ""), request.nextUrl.origin);
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return NextResponse.json({
    message: "If an account uses that email address, we sent a password reset link.",
  });
}
