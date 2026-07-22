import type { District } from "./locations";
import type { PropertyType } from "./property";

export type ListingRole = "agent" | "homeowner";
export type ListingStatus = "pending" | "active" | "stopped" | "taken";

export interface Listing {
  id: number;
  district: District;
  place: string;
  landmark: string;
  property_type: PropertyType;
  property_details: string;
  price: number;
  parking_two_wheeler: number;
  parking_four_wheeler: number;
  other_facilities: string;
  name: string;
  phone: string;
  role: ListingRole;
  image_path: string | null;
  image_paths: string[];
  video_path: string | null;
  status: ListingStatus;
  featured: number;
  created_at: string;
}

export type PublicListing = Omit<Listing, "role" | "name" | "phone">;

export interface VisitOrder {
  id: number;
  listing_id: number;
  name: string;
  phone: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
  district?: District;
  place?: string;
  landmark?: string;
  listing_name?: string;
  property_type?: PropertyType;
  property_details?: string;
  price?: number;
  listing_role?: ListingRole;
  image_path?: string | null;
}

export interface CustomOrder {
  id: number;
  district: District;
  place: string;
  landmark: string;
  property_type: PropertyType;
  property_details: string;
  price_min: number;
  price_max: number;
  name: string;
  phone: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export interface AppUser {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  blocked: number;
  created_at: string;
}

export interface PublicUser {
  id: number;
  name: string;
  phone: string;
  address: string | null;
}

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  remarks: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export type NewsStatus = "active" | "stopped";

export interface NewsItem {
  id: number;
  heading: string;
  body: string;
  image_path: string | null;
  status: NewsStatus;
  created_at: string;
}
