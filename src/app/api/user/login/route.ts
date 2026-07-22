import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/userAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required." },
        { status: 400 },
      );
    }

    const result = await loginUser(String(phone), String(password));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User login failed:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
