import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image or video files are allowed." },
        { status: 400 },
      );
    }

    if (isImage && file.size > IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 5MB." },
        { status: 400 },
      );
    }

    if (isVideo && file.size > VIDEO_MAX_BYTES) {
      return NextResponse.json(
        { error: "Video must be under 100MB." },
        { status: 400 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const defaultExt = isVideo ? ".mp4" : ".jpg";
    const ext = path.extname(file.name) || defaultExt;
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      path: `/uploads/${filename}`,
      kind: isVideo ? "video" : "image",
    });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
