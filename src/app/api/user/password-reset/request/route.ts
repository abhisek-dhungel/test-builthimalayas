import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/userAuth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const appUrl = process.env.APP_URL?.trim() || request.nextUrl.origin;
    await requestPasswordReset(String(email ?? ""), appUrl);
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not send a reset email right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    message: "If an account uses that email address, we sent a password reset link.",
  });
}
