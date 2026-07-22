import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function cloudinaryReady() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadToCloudinary(
  buffer: Buffer,
  kind: "image" | "video",
  filename: string,
) {
  configureCloudinary();
  const folder = "builthimalayas";
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: kind,
        public_id: path.parse(filename).name,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ secure_url: result.secure_url });
      },
    );
    stream.end(buffer);
  });
}

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

    const kind = isVideo ? "video" : "image";
    const defaultExt = isVideo ? ".mp4" : ".jpg";
    const ext = path.extname(file.name) || defaultExt;
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Prefer Cloudinary when configured (Vercel / production).
    if (cloudinaryReady()) {
      const result = await uploadToCloudinary(buffer, kind, filename);
      return NextResponse.json({ path: result.secure_url, kind });
    }

    // Local disk fallback (development).
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      path: `/uploads/${filename}`,
      kind,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
