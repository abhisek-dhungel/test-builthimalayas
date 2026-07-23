"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  DISTRICTS,
  PLACES,
  type District,
} from "@/lib/locations";
import {
  FLAT_LAYOUTS,
  PROPERTY_TYPES,
  ROOM_LAYOUTS,
  type PropertyType,
} from "@/lib/property";
import { priceBandFromTarget, type SearchSort } from "@/lib/searchParams";
import type { PublicListing } from "@/lib/types";
import { ListingRowCard } from "./ListingRowCard";
import { PersonalizedOrderModal } from "./PersonalizedOrderModal";
import { PriceRangeSlider } from "./PriceRangeSlider";

const PRICE_MIN = 0;
const PRICE_MAX = 200_000;

type SortOption = SearchSort;

type ParkingFilter = "two" | "four" | "none";

type SearchBrowseProps = {
  listings: PublicListing[];
};

function selectOne<T>(current: T | null, next: T): T | null {
  return current === next ? null : next;
}

function parsePropertyType(value: string | null): PropertyType | null {
  if (value === "room" || value === "flat" || value === "commercial") {
    return value;
  }
  return null;
}

function parseSort(value: string | null): SortOption {
  if (value === "price_high" || value === "price_low" || value === "latest") {
    return value;
  }
  return "latest";
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`search-browse-chip${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function SearchBrowse({ listings }: SearchBrowseProps) {
  const searchParams = useSearchParams();

  const initialArea = searchParams.get("area");
  const initialPropertyType = parsePropertyType(
    searchParams.get("property_type"),
  );
  const initialSpaceType = searchParams.get("space_type");
  const initialSort = parseSort(searchParams.get("sort"));
  const initialPrice = Number(searchParams.get("price"));
  const initialFeatured =
    searchParams.get("featured") === "1" ||
    searchParams.get("verified") === "1";
  const initialBand =
    Number.isFinite(initialPrice) && initialPrice > 0
      ? priceBandFromTarget(initialPrice)
      : null;

  const [district, setDistrict] = useState<District>("kathmandu");
  const [area, setArea] = useState<string | null>(initialArea);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(
    initialPropertyType,
  );
  const [spaceType, setSpaceType] = useState<string | null>(initialSpaceType);
  const [parking, setParking] = useState<ParkingFilter | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured);
  const [priceMin, setPriceMin] = useState(
    initialBand?.priceMin ?? PRICE_MIN,
  );
  const [priceMax, setPriceMax] = useState(
    initialBand?.priceMax ?? PRICE_MAX,
  );
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showPersonalizedOrder, setShowPersonalizedOrder] = useState(false);

  const areaOptions = PLACES[district] ?? [];

  const spaceOptions = useMemo(() => {
    if (!propertyType) {
      return [...ROOM_LAYOUTS, ...FLAT_LAYOUTS];
    }
    if (propertyType === "room") return [...ROOM_LAYOUTS];
    if (propertyType === "flat") return [...FLAT_LAYOUTS];
    return [];
  }, [propertyType]);

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => {
      if (listing.district !== district) return false;

      if (area && listing.place !== area) return false;

      if (propertyType && listing.property_type !== propertyType) return false;

      if (spaceType && listing.property_details !== spaceType) return false;

      if (parking) {
        const two = listing.parking_two_wheeler > 0;
        const four = listing.parking_four_wheeler > 0;
        const none = !two && !four;
        const matches =
          (parking === "two" && two) ||
          (parking === "four" && four) ||
          (parking === "none" && none);
        if (!matches) return false;
      }

      if (listing.price < priceMin || listing.price > priceMax) return false;

      if (featuredOnly && listing.featured !== 1) return false;

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "price_low") return a.price - b.price;
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });

    return result;
  }, [
    listings,
    district,
    area,
    propertyType,
    spaceType,
    parking,
    featuredOnly,
    priceMin,
    priceMax,
    sortBy,
  ]);

  function clearFilters() {
    setDistrict("kathmandu");
    setArea(null);
    setPropertyType(null);
    setSpaceType(null);
    setParking(null);
    setFeaturedOnly(false);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
  }

  const hasActiveFilters =
    area !== null ||
    propertyType !== null ||
    spaceType !== null ||
    parking !== null ||
    featuredOnly ||
    priceMin > PRICE_MIN ||
    priceMax < PRICE_MAX;

  const filterPanel = (
    <aside className="search-browse-filters">
      <div className="search-browse-filters-top">
        <h2 className="search-browse-filters-heading">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="search-browse-clear"
        >
          Clear
        </button>
      </div>

      <div className="search-browse-filters-body">
        <div>
          <label className="search-browse-field-label" htmlFor="search-district">
            Location
          </label>
          <select
            id="search-district"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value as District);
              setArea(null);
            }}
            className="search-browse-select"
          >
            {DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="search-browse-field-label">Verified</p>
          <div className="search-browse-chips">
            <FilterChip
              active={featuredOnly}
              onClick={() => setFeaturedOnly((prev) => !prev)}
            >
              Verified only
            </FilterChip>
          </div>
        </div>

        <div>
          <p className="search-browse-field-label">Area</p>
          <div className="search-browse-chips">
            {areaOptions.map((option) => (
              <FilterChip
                key={option}
                active={area === option}
                onClick={() => setArea((prev) => selectOne(prev, option))}
              >
                {option}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="search-browse-field-label">Property type</p>
          <div className="search-browse-chips">
            {PROPERTY_TYPES.map((type) => (
              <FilterChip
                key={type.value}
                active={propertyType === type.value}
                onClick={() => {
                  setPropertyType((prev) => selectOne(prev, type.value));
                  setSpaceType(null);
                }}
              >
                {type.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {spaceOptions.length > 0 && (
          <div>
            <p className="search-browse-field-label">Space type</p>
            <div className="search-browse-chips">
              {spaceOptions.map((space) => (
                <FilterChip
                  key={space}
                  active={spaceType === space}
                  onClick={() =>
                    setSpaceType((prev) => selectOne(prev, space))
                  }
                >
                  {space}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="search-browse-field-label">Parking</p>
          <div className="search-browse-chips">
            <FilterChip
              active={parking === "two"}
              onClick={() => setParking((prev) => selectOne(prev, "two"))}
            >
              2 wheelers
            </FilterChip>
            <FilterChip
              active={parking === "four"}
              onClick={() => setParking((prev) => selectOne(prev, "four"))}
            >
              4 wheelers
            </FilterChip>
            <FilterChip
              active={parking === "none"}
              onClick={() => setParking((prev) => selectOne(prev, "none"))}
            >
              No parking
            </FilterChip>
          </div>
        </div>

        <div className="search-browse-price">
          <p className="search-browse-field-label">Price range</p>
          <PriceRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            valueMin={priceMin}
            valueMax={priceMax}
            onChange={(nextMin, nextMax) => {
              setPriceMin(nextMin);
              setPriceMax(nextMax);
            }}
          />
        </div>
      </div>
    </aside>
  );

  return (
    <main className="search-browse flex-1">
      <div className="search-browse-inner">
        <div className="search-browse-kicker-row">
          <p className="search-browse-kicker">Filter from all listings</p>
          <button
            type="button"
            className="search-browse-personalized-btn"
            onClick={() => setShowPersonalizedOrder(true)}
          >
            Personalized order
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="search-browse-mobile-bar">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="search-browse-filters-toggle"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="6" y1="18" x2="18" y2="18" />
            </svg>
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
        </div>

        <div className="search-browse-layout">
          <div
            className={`search-browse-filters-wrap${filtersOpen ? " is-open" : ""}`}
          >
            {filterPanel}
          </div>

          <section className="search-browse-results">
            <div className="search-browse-toolbar">
              <p className="search-browse-count">Results</p>
              <label className="search-browse-sort">
                Sort
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="latest">Latest First</option>
                  <option value="price_high">Price high to low</option>
                  <option value="price_low">Price low to high</option>
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <div className="search-browse-empty">
                <p>
                  No listings match these filters. Try clearing some options.
                </p>
              </div>
            ) : (
              <div className="search-browse-list">
                {filtered.map((listing) => (
                  <ListingRowCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showPersonalizedOrder && (
        <PersonalizedOrderModal
          onClose={() => setShowPersonalizedOrder(false)}
        />
      )}
    </main>
  );
}
