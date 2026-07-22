import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet, dbRun, resolvePublicImagePath } from "@/lib/database";
import { isMediaPath } from "@/lib/mediaPaths";
import type { NewsItem } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

async function tryDeleteImage(imagePath: string | null | undefined) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  try {
    const fullPath = resolvePublicImagePath(imagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {
    // Ignore on read-only filesystems / Cloudinary URLs
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const newsId = Number(id);
    const payload = await request.json();

    const item = await dbGet<NewsItem>("SELECT * FROM news WHERE id = ?", [
      newsId,
    ]);

    if (!item) {
      return NextResponse.json({ error: "News not found." }, { status: 404 });
    }

    if (payload.action === "delete") {
      await tryDeleteImage(item.image_path);
      await dbRun("DELETE FROM news WHERE id = ?", [newsId]);
      return NextResponse.json({ success: true });
    }

    if (payload.action === "stop") {
      await dbRun("UPDATE news SET status = 'stopped' WHERE id = ?", [newsId]);
      return NextResponse.json({ success: true });
    }

    if (payload.action === "activate") {
      await dbRun("UPDATE news SET status = 'active' WHERE id = ?", [newsId]);
      return NextResponse.json({ success: true });
    }

    if (payload.action === "update" || payload.body !== undefined) {
      const heading = String(payload.heading ?? item.heading ?? "").trim();
      const text = String(payload.body ?? "").trim();
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

      let nextImage = item.image_path;
      if (payload.image_path !== undefined) {
        if (payload.image_path === null || payload.image_path === "") {
          nextImage = null;
        } else if (isMediaPath(payload.image_path)) {
          nextImage = payload.image_path;
        } else {
          return NextResponse.json(
            { error: "Invalid image path." },
            { status: 400 },
          );
        }
      }

      if (item.image_path && item.image_path !== nextImage) {
        await tryDeleteImage(item.image_path);
      }

      await dbRun(
        "UPDATE news SET heading = ?, body = ?, image_path = ? WHERE id = ?",
        [heading, text, nextImage, newsId],
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Admin news action failed:", error);
    return NextResponse.json(
      { error: "Could not update news." },
      { status: 500 },
    );
  }
}
