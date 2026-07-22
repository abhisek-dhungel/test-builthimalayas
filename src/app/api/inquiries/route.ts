import { NextRequest, NextResponse } from "next/server";
import { dbRun } from "@/lib/database";
import { isValidPhone } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const remarks = String(body.remarks ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Enter a valid name." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Nepal mobile number." },
        { status: 400 },
      );
    }

    const result = await dbRun(
      `INSERT INTO inquiries (name, phone, remarks, status)
       VALUES (?, ?, ?, 'new')`,
      [name, phone, remarks || null],
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error("Create inquiry failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit inquiry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
