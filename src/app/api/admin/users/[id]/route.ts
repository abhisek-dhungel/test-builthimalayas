import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet, dbRun } from "@/lib/database";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const body = await request.json();
  if (typeof body.blocked !== "boolean") {
    return NextResponse.json(
      { error: "Invalid blocked value." },
      { status: 400 },
    );
  }

  const user = await dbGet<{ id: number }>(
    "SELECT id FROM users WHERE id = ?",
    [userId],
  );
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await dbRun("UPDATE users SET blocked = ? WHERE id = ?", [
    body.blocked ? 1 : 0,
    userId,
  ]);

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const user = await dbGet<{ id: number }>(
    "SELECT id FROM users WHERE id = ?",
    [userId],
  );
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await dbRun("DELETE FROM favorites WHERE user_id = ?", [userId]);
  await dbRun("DELETE FROM users WHERE id = ?", [userId]);

  return NextResponse.json({ success: true });
}
