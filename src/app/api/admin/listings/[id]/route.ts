import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet, dbRun, resolvePublicImagePath } from "@/lib/database";
import { parseImagePaths } from "@/lib/images";

type Params = { params: Promise<{ id: string }> };

async function tryDeleteImage(imagePath: string | null | undefined) {
  if (!imagePath) return;
  try {
    const fullPath = resolvePublicImagePath(imagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {
    // Ignore on read-only filesystems (e.g. Vercel)
  }
}

async function tryDeleteListingImages(listing: Record<string, unknown>) {
  const paths = parseImagePaths(
    listing.image_paths,
    listing.image_path as string | null,
  );
  const uniquePaths = [...new Set(paths)];
  for (const imagePath of uniquePaths) {
    await tryDeleteImage(imagePath);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const listing = await dbGet<Record<string, unknown>>(
      "SELECT * FROM listings WHERE id = ?",
      [Number(id)],
    );

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (body.action === "delete") {
      await tryDeleteListingImages(listing);
      await dbRun("DELETE FROM listings WHERE id = ?", [Number(id)]);
      return NextResponse.json({ success: true });
    }

    if (body.action === "stop") {
      await dbRun("UPDATE listings SET status = 'stopped' WHERE id = ?", [
        Number(id),
      ]);
      return NextResponse.json({ success: true });
    }

    if (body.action === "activate") {
      await dbRun("UPDATE listings SET status = 'active' WHERE id = ?", [
        Number(id),
      ]);
      return NextResponse.json({ success: true });
    }

    if (body.action === "reject") {
      await tryDeleteListingImages(listing);
      await dbRun("DELETE FROM listings WHERE id = ?", [Number(id)]);
      return NextResponse.json({ success: true });
    }

    if (body.action === "taken" || body.action === "sold") {
      await dbRun("UPDATE listings SET status = 'taken' WHERE id = ?", [
        Number(id),
      ]);
      return NextResponse.json({ success: true });
    }

    if (body.action === "feature") {
      await dbRun(
        "UPDATE listings SET featured = 1 WHERE id = ? AND status = 'active'",
        [Number(id)],
      );
      return NextResponse.json({ success: true });
    }

    if (body.action === "unfeature") {
      await dbRun("UPDATE listings SET featured = 0 WHERE id = ?", [Number(id)]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Admin listing action failed:", error);
    const message =
      error instanceof Error ? error.message : "Action failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
