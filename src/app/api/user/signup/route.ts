import { NextRequest, NextResponse } from "next/server";
import { signupUser } from "@/lib/userAuth";
import { isValidPhone } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, address, password } = body;

    if (!isValidPhone(String(phone ?? ""))) {
      return NextResponse.json(
        { error: "Enter a valid Nepal mobile number." },
        { status: 400 },
      );
    }

    const result = await signupUser({
      name: String(name ?? ""),
      phone: String(phone ?? ""),
      address: address ? String(address) : undefined,
      password: String(password ?? ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
