import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbAll, dbRun } from "@/lib/database";
import type { NewsItem } from "@/lib/types";

function isValidUploadPath(path: unknown): path is string {
  return typeof path === "string" && path.startsWith("/uploads/");
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await dbAll<NewsItem>(
    `SELECT * FROM news ORDER BY created_at DESC`,
  );
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const heading = String(payload.heading ?? "").trim();
    const text = String(payload.body ?? "").trim();
    const imagePath =
      payload.image_path == null || payload.image_path === ""
        ? null
        : String(payload.image_path);

    if (!heading) {
      return NextResponse.json(
        { error: "News heading is required." },
        { status: 400 },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "News text is required." },
        { status: 400 },
      );
    }

    if (imagePath !== null && !isValidUploadPath(imagePath)) {
      return NextResponse.json(
        { error: "Invalid image path." },
        { status: 400 },
      );
    }

    const result = await dbRun(
      `INSERT INTO news (heading, body, image_path, status) VALUES (?, ?, ?, 'active')`,
      [heading, text, imagePath],
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error("Admin create news failed:", error);
    return NextResponse.json(
      { error: "Could not create news." },
      { status: 500 },
    );
  }
}
