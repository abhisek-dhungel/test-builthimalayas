import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/userAuth";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    const result = await resetPassword(
      String(token ?? ""),
      String(password ?? ""),
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
