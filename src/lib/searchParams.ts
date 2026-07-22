import type { PropertyType } from "./property";

export type SearchSort = "latest" | "price_high" | "price_low";

export type SearchQuery = {
  area?: string | null;
  propertyType?: PropertyType | null;
  spaceType?: string | null;
  price?: number | null;
  sort?: SearchSort | null;
  featured?: boolean | null;
};

export function buildSearchHref(query: SearchQuery): string {
  const params = new URLSearchParams();
  if (query.area) params.set("area", query.area);
  if (query.propertyType) params.set("property_type", query.propertyType);
  if (query.spaceType) params.set("space_type", query.spaceType);
  if (query.price && query.price > 0) params.set("price", String(query.price));
  if (query.sort && query.sort !== "latest") params.set("sort", query.sort);
  if (query.featured) params.set("featured", "1");
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function priceBandFromTarget(price: number): {
  priceMin: number;
  priceMax: number;
} {
  return {
    priceMin: Math.max(0, Math.round(price * 0.9)),
    priceMax: Math.round(price * 1.1),
  };
}
