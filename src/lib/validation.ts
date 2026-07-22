import { PLACES, type District } from "./locations";
import type { PropertyType } from "./property";
import { isValidPropertyDetails } from "./property";

export function isValidDistrict(value: string): value is District {
  return value === "kathmandu";
}

export function isValidPlace(district: District, place: string): boolean {
  return PLACES[district]?.includes(place) ?? false;
}

export function isValidPropertyType(value: string): value is PropertyType {
  return value === "room" || value === "flat" || value === "commercial";
}

export function isValidPropertyDetailsField(
  type: PropertyType,
  details: string,
): boolean {
  return isValidPropertyDetails(type, details);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "");
  return /^(\+977)?9[678]\d{8}$/.test(cleaned) || /^9[678]\d{8}$/.test(cleaned);
}

export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0 && price <= 10_000_000;
}

export function isValidPriceRange(min: number, max: number): boolean {
  return (
    isValidPrice(min) && isValidPrice(max) && min <= max
  );
}

export function isValidParkingCounts(
  noParking: boolean,
  twoWheeler: number,
  fourWheeler: number,
): boolean {
  if (noParking) return twoWheeler === 0 && fourWheeler === 0;
  return (
    (twoWheeler > 0 || fourWheeler > 0) &&
    twoWheeler >= 0 &&
    fourWheeler >= 0 &&
    twoWheeler <= 50 &&
    fourWheeler <= 50
  );
}
