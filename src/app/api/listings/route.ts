import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbRun } from "@/lib/database";
import { toPublicListing, toPublicListingCard } from "@/lib/listings";
import {
  getDisplayImagePath,
  isValidImagePaths,
  isValidVideoPath,
  serializeImagePaths,
} from "@/lib/images";
import {
  isValidDistrict,
  isValidParkingCounts,
  isValidPhone,
  isValidPlace,
  isValidPrice,
  isValidPropertyDetailsField,
  isValidPropertyType,
} from "@/lib/validation";

export async function GET() {
  const listings = await dbAll<Record<string, unknown>>(
    `SELECT * FROM listings
     WHERE status IN ('active', 'taken')
     ORDER BY
       CASE status WHEN 'active' THEN 0 ELSE 1 END,
       featured DESC,
       created_at DESC`,
  );

  return NextResponse.json(listings.map(toPublicListingCard));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      district,
      place,
      landmark,
      property_type,
      property_details,
      price,
      parking_two_wheeler,
      parking_four_wheeler,
      other_facilities,
      name,
      phone,
      role,
      image_path,
      image_paths,
      display_image_index,
      video_path,
    } = body;

    if (
      !district ||
      !place ||
      !landmark ||
      !property_type ||
      !property_details?.trim() ||
      price === undefined ||
      price === null ||
      !name ||
      !phone ||
      !role
    ) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 },
      );
    }

    if (!isValidDistrict(district)) {
      return NextResponse.json({ error: "Invalid district." }, { status: 400 });
    }

    if (!isValidPlace(district, place)) {
      return NextResponse.json({ error: "Invalid place." }, { status: 400 });
    }

    if (!isValidPropertyType(property_type)) {
      return NextResponse.json(
        { error: "Invalid property type." },
        { status: 400 },
      );
    }

    if (!isValidPropertyDetailsField(property_type, property_details)) {
      return NextResponse.json(
        { error: "Select or enter valid property details." },
        { status: 400 },
      );
    }

    if (role !== "agent" && role !== "homeowner") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (!isValidPrice(parsedPrice)) {
      return NextResponse.json(
        { error: "Enter a valid monthly rent price." },
        { status: 400 },
      );
    }

    const twoWheeler = Math.max(0, Math.round(Number(parking_two_wheeler) || 0));
    const fourWheeler = Math.max(
      0,
      Math.round(Number(parking_four_wheeler) || 0),
    );
    const noParking = twoWheeler === 0 && fourWheeler === 0;

    if (!isValidParkingCounts(noParking, twoWheeler, fourWheeler) && !noParking) {
      return NextResponse.json(
        { error: "Enter valid parking details." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone.trim())) {
      return NextResponse.json(
        { error: "Enter a valid Nepal mobile number." },
        { status: 400 },
      );
    }

    let storedImagePaths: string[] = [];
    let storedDisplayPath: string | null = null;

    if (image_paths !== undefined && image_paths !== null) {
      if (!isValidImagePaths(image_paths)) {
        return NextResponse.json(
          { error: "Invalid property photos." },
          { status: 400 },
        );
      }
      storedImagePaths = image_paths;
      const displayIndex = Number(display_image_index ?? 0);
      storedDisplayPath = getDisplayImagePath(storedImagePaths, displayIndex);
    } else if (image_path) {
      storedImagePaths = [image_path];
      storedDisplayPath = image_path;
    }

    let storedVideoPath: string | null = null;
    if (video_path !== undefined && video_path !== null && video_path !== "") {
      if (!isValidVideoPath(video_path)) {
        return NextResponse.json(
          { error: "Invalid property video." },
          { status: 400 },
        );
      }
      storedVideoPath = video_path;
    }

    const result = await dbRun(
      `INSERT INTO listings (
        district, place, landmark, property_type, property_details, price,
        parking_two_wheeler, parking_four_wheeler, other_facilities,
        name, phone, role, image_path, image_paths, video_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        district,
        place,
        landmark.trim(),
        property_type,
        property_details.trim(),
        Math.round(parsedPrice),
        twoWheeler,
        fourWheeler,
        String(other_facilities ?? "").trim() || null,
        name.trim(),
        phone.trim(),
        role,
        storedDisplayPath,
        serializeImagePaths(storedImagePaths),
        storedVideoPath,
      ],
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error("Create listing failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create listing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
