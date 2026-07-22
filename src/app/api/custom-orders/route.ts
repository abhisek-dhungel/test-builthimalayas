import { NextRequest, NextResponse } from "next/server";
import { dbRun } from "@/lib/database";
import {
  isValidDistrict,
  isValidPhone,
  isValidPlace,
  isValidPriceRange,
  isValidPropertyDetailsField,
  isValidPropertyType,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      district,
      place,
      landmark,
      property_type,
      property_details,
      price_min,
      price_max,
      name,
      phone,
    } = body;

    if (
      !district ||
      !place ||
      !landmark ||
      !property_type ||
      !property_details?.trim() ||
      price_min === undefined ||
      price_max === undefined ||
      !name ||
      !phone
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

    const parsedMin = Number(price_min);
    const parsedMax = Number(price_max);
    if (!isValidPriceRange(parsedMin, parsedMax)) {
      return NextResponse.json(
        { error: "Enter a valid monthly rent budget range." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone.trim())) {
      return NextResponse.json(
        { error: "Enter a valid Nepal mobile number." },
        { status: 400 },
      );
    }

    const result = await dbRun(
      `INSERT INTO custom_orders (
        district, place, landmark, property_type, property_details,
        price_min, price_max, name, phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        district,
        place,
        landmark.trim(),
        property_type,
        property_details.trim(),
        Math.round(parsedMin),
        Math.round(parsedMax),
        name.trim(),
        phone.trim(),
      ],
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error("Create custom order failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit custom order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
