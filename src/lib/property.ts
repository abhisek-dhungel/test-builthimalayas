export type PropertyType = "room" | "flat" | "commercial";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "room", label: "Room" },
  { value: "flat", label: "Flat" },
  { value: "commercial", label: "Commercial" },
];

export const ROOM_LAYOUTS = [
  "1 Room",
  "2 Room",
  "3 Room",
] as const;

export const FLAT_LAYOUTS = [
  "2BHK",
  "3BHK",
  "2BK",
  "1BK",
] as const;

export type RoomLayout = (typeof ROOM_LAYOUTS)[number];
export type FlatLayout = (typeof FLAT_LAYOUTS)[number];

export function getPropertyTypeLabel(
  type: PropertyType | string | null | undefined,
): string {
  if (!type) return "Flat";
  return PROPERTY_TYPES.find((p) => p.value === type)?.label ?? "Flat";
}

export function formatPrice(price: number | null | undefined): string {
  const value = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(value) || value <= 0) {
    return "Price on request";
  }
  return `Rs. ${value.toLocaleString("en-NP")}/Month`;
}

export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const minValue = typeof min === "number" ? min : Number(min);
  const maxValue = typeof max === "number" ? max : Number(max);
  if (
    !Number.isFinite(minValue) ||
    !Number.isFinite(maxValue) ||
    minValue <= 0 ||
    maxValue <= 0
  ) {
    return "Budget on request";
  }
  if (minValue === maxValue) {
    return formatPrice(minValue);
  }
  return `Rs. ${minValue.toLocaleString("en-NP")} – ${maxValue.toLocaleString("en-NP")}/Month`;
}

export function formatParkingLabel(
  twoWheeler: number | null | undefined,
  fourWheeler: number | null | undefined,
): string | null {
  const two = Number(twoWheeler) || 0;
  const four = Number(fourWheeler) || 0;
  const parts: string[] = [];

  if (two > 0) {
    parts.push(
      `${two}- Two wheelers parking`,
    );
  }
  if (four > 0) {
    parts.push(
      `${four}- Four wheelers parking`,
    );
  }

  if (parts.length === 0) return "No parking";
  return parts.join(" · ");
}

export function formatListingTitle(
  propertyDetails: string,
  place: string,
): string {
  const details = propertyDetails.trim() || "Property";
  return `${details} for Rent in ${place}`;
}

export function getLayoutsForType(type: PropertyType): readonly string[] {
  if (type === "room") return ROOM_LAYOUTS;
  if (type === "flat") return FLAT_LAYOUTS;
  return [];
}

export function isValidPropertyDetails(
  type: PropertyType,
  details: string,
): boolean {
  const trimmed = details.trim();
  if (!trimmed) return false;
  if (type === "room") return (ROOM_LAYOUTS as readonly string[]).includes(trimmed);
  if (type === "flat") return (FLAT_LAYOUTS as readonly string[]).includes(trimmed);
  if (type === "commercial") return trimmed.length >= 3;
  return false;
}
