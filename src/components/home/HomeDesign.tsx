"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BuiltLogo } from "@/components/BuiltLogo";
import { VerifiedListingCard } from "@/components/home/VerifiedListingCard";
import { PLACES } from "@/lib/locations";
import {
  FLAT_LAYOUTS,
  PROPERTY_TYPES,
  ROOM_LAYOUTS,
  type PropertyType,
} from "@/lib/property";
import {
  buildSearchHref,
  type SearchSort,
} from "@/lib/searchParams";
import type { NewsItem, PublicListing, PublicUser } from "@/lib/types";

const AREAS = PLACES.kathmandu;

const SERVICE_AREAS: { name: string; mapQuery: string }[] = [
  { name: "Maitidevi", mapQuery: "Maitidevi, Kathmandu, Nepal" },
  { name: "Dillibazar", mapQuery: "Dillibazar, Kathmandu, Nepal" },
  { name: "Ghattekulo", mapQuery: "Ghattekulo, Kathmandu, Nepal" },
  { name: "Kalikasthan", mapQuery: "Kalikasthan, Kathmandu, Nepal" },
  { name: "Anamnagar", mapQuery: "Anamnagar, Kathmandu, Nepal" },
];

function mapEmbedSrc(area: (typeof SERVICE_AREAS)[number]) {
  const query = encodeURIComponent(area.mapQuery);
  return `https://maps.google.com/maps?q=${query}&z=15&hl=en&output=embed`;
}
const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "latest", label: "Latest First" },
  { value: "price_high", label: "Price high to low" },
  { value: "price_low", label: "Price low to high" },
];

type OpenField =
  | "location"
  | "property"
  | "price"
  | "space"
  | "sort"
  | null;

function Chevron() {
  return (
    <svg
      className="chevron"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type HomeDesignProps = {
  featuredListings: PublicListing[];
  newsItems: NewsItem[];
};

export function HomeDesign({ featuredListings, newsItems }: HomeDesignProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [openField, setOpenField] = useState<OpenField>(null);
  const [area, setArea] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [spaceType, setSpaceType] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [sortBy, setSortBy] = useState<SearchSort>("latest");
  const listingsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const newsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollNewsPrev, setCanScrollNewsPrev] = useState(false);
  const [canScrollNewsNext, setCanScrollNewsNext] = useState(false);

  const newestListings = useMemo(
    () => featuredListings.slice(0, 4),
    [featuredListings],
  );
  const olderListings = useMemo(
    () => featuredListings.slice(4),
    [featuredListings],
  );

  const updateListingsScroll = useCallback(() => {
    const el = listingsTrackRef.current;
    if (!el) {
      setCanScrollNext(false);
      return;
    }
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  }, []);

  function scrollListingsNext() {
    const el = listingsTrackRef.current;
    if (!el) return;
    const card = el.querySelector(".listing-card-slide") as HTMLElement | null;
    const amount = card
      ? card.getBoundingClientRect().width + 26
      : Math.max(280, el.clientWidth * 0.8);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  const updateNewsScroll = useCallback(() => {
    const el = newsTrackRef.current;
    if (!el) {
      setCanScrollNewsPrev(false);
      setCanScrollNewsNext(false);
      return;
    }
    setCanScrollNewsPrev(el.scrollLeft > 12);
    setCanScrollNewsNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  }, []);

  function scrollNewsBy(direction: -1 | 1) {
    const el = newsTrackRef.current;
    if (!el) return;
    const card = el.querySelector(".home-news-slide") as HTMLElement | null;
    const amount = card
      ? card.getBoundingClientRect().width + 18
      : Math.max(220, el.clientWidth * 0.35);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/user/me", { credentials: "same-origin" });
        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    updateListingsScroll();
    const el = listingsTrackRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateListingsScroll, { passive: true });
    window.addEventListener("resize", updateListingsScroll);

    const frame = window.requestAnimationFrame(updateListingsScroll);
    return () => {
      el.removeEventListener("scroll", updateListingsScroll);
      window.removeEventListener("resize", updateListingsScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [olderListings, updateListingsScroll]);

  useEffect(() => {
    updateNewsScroll();
    const el = newsTrackRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateNewsScroll, { passive: true });
    window.addEventListener("resize", updateNewsScroll);

    const frame = window.requestAnimationFrame(updateNewsScroll);
    return () => {
      el.removeEventListener("scroll", updateNewsScroll);
      window.removeEventListener("resize", updateNewsScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [newsItems, updateNewsScroll]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpenField(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const spaceOptions = useMemo(() => {
    if (!propertyType) return [...ROOM_LAYOUTS, ...FLAT_LAYOUTS];
    if (propertyType === "room") return [...ROOM_LAYOUTS];
    if (propertyType === "flat") return [...FLAT_LAYOUTS];
    return [];
  }, [propertyType]);

  const priceValue = Number(priceInput.replace(/[^\d]/g, ""));
  const hasPrice = Number.isFinite(priceValue) && priceValue > 0;

  const toggleField = useCallback((field: OpenField) => {
    setOpenField((current) => (current === field ? null : field));
  }, []);

  function runSearch() {
    router.push(
      buildSearchHref({
        area,
        propertyType,
        spaceType,
        price: hasPrice ? priceValue : null,
        sort: sortBy,
      }),
    );
  }

  async function logout() {
    await fetch("/api/user/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
    router.refresh();
  }

  const locationLabel = area ?? "Location";
  const propertyLabel =
    PROPERTY_TYPES.find((p) => p.value === propertyType)?.label ??
    "Property Type";
  const spaceLabel = spaceType ?? "Space";
  const priceLabel = hasPrice
    ? `Rs. ${priceValue.toLocaleString("en-NP")}`
    : "Price";
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort By";

  return (
    <div className="home-design">
      <header className="top">
        <div className="top-row">
          <Link href="/" className="brand">
            <BuiltLogo size="sm" showTagline />
            <div className="brand-divider" />
            <span className="tagline">
              Building Nations
              <br />
              Serving People
            </span>
          </Link>
          <div className="header-actions">
            {user ? (
              <button type="button" className="btn-login" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link href="/login?next=/" className="btn-login">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="rent-strip">
        <div className="rent-row">
          <span />
          <div className="rent-center">
            <div className="rent-heading">RENT</div>
            <div className="rent-slogan">
              Quick &nbsp;·&nbsp; Convenient &nbsp;·&nbsp; Credible
            </div>
          </div>
          <Link href="/list" className="btn-list-property">
            List Your Property
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
          </Link>
        </div>
      </section>

      <nav className="hoods">
        <div className="hoods-row">
          {AREAS.map((place) => (
            <Link key={place} href={buildSearchHref({ area: place })}>
              {place}
            </Link>
          ))}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-quicklinks">
          <Link className="quicklink-btn" href="/search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search All Listings
          </Link>
          <Link
            className="quicklink-btn"
            href={user ? "/favorites" : "/login?next=/favorites"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            Favourites
          </Link>
        </div>

        <div className="hero-center">
          <h1 className="hero-title">Rent your choice</h1>

          <div className="search-panel" ref={panelRef}>
            <div
              className={`search-field ${openField === "location" ? "is-open" : ""}`}
            >
              <button type="button" onClick={() => toggleField("location")}>
                <span>{locationLabel}</span>
                <Chevron />
              </button>
              {openField === "location" && (
                <div className="search-dropdown">
                  {AREAS.map((place) => (
                    <button
                      key={place}
                      type="button"
                      className={area === place ? "is-active" : ""}
                      onClick={() => {
                        setArea(place);
                        setOpenField(null);
                      }}
                    >
                      {place}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`search-field ${openField === "property" ? "is-open" : ""}`}
            >
              <button type="button" onClick={() => toggleField("property")}>
                <span>{propertyLabel}</span>
                <Chevron />
              </button>
              {openField === "property" && (
                <div className="search-dropdown">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={propertyType === type.value ? "is-active" : ""}
                      onClick={() => {
                        setPropertyType(type.value);
                        setSpaceType(null);
                        setOpenField(null);
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`search-field ${openField === "price" ? "is-open" : ""}`}
            >
              <button type="button" onClick={() => toggleField("price")}>
                <span>{priceLabel}</span>
                <Chevron />
              </button>
              {openField === "price" && (
                <div className="search-dropdown search-price-box">
                  <label htmlFor="hero-price">Monthly rent (Rs.)</label>
                  <input
                    id="hero-price"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="e.g. 20000"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    autoFocus
                  />
                  <p>Shows listings within ±10% of this price.</p>
                </div>
              )}
            </div>

            <div
              className={`search-field ${openField === "space" ? "is-open" : ""}`}
            >
              <button type="button" onClick={() => toggleField("space")}>
                <span>{spaceLabel}</span>
                <Chevron />
              </button>
              {openField === "space" && (
                <div className="search-dropdown">
                  {spaceOptions.length === 0 ? (
                    <button type="button" disabled>
                      Select property type first
                    </button>
                  ) : (
                    spaceOptions.map((space) => (
                      <button
                        key={space}
                        type="button"
                        className={spaceType === space ? "is-active" : ""}
                        onClick={() => {
                          setSpaceType(space);
                          setOpenField(null);
                        }}
                      >
                        {space}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div
              className={`search-field ${openField === "sort" ? "is-open" : ""}`}
            >
              <button type="button" onClick={() => toggleField("sort")}>
                <span>{sortLabel}</span>
                <Chevron />
              </button>
              {openField === "sort" && (
                <div className="search-dropdown">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={sortBy === option.value ? "is-active" : ""}
                      onClick={() => {
                        setSortBy(option.value);
                        setOpenField(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="btn-search" onClick={runSearch}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
          </div>

          <div className="hero-dots" aria-hidden>
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="listings">
        <div className="listings-inner">
          <div className="listings-head">
            <div className="listings-eyebrow">Trusted &amp; Inspected</div>
            <div className="listings-title-row">
              <h2 className="listings-title">Verified Listings</h2>
              <Link
                href={buildSearchHref({ featured: true })}
                className="listings-all-link"
              >
                All Verified
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {featuredListings.length === 0 ? (
            <p className="listings-empty">
              Featured listings will appear here once approved.
            </p>
          ) : (
            <div className="listings-stack">
              <div className="listings-grid">
                {newestListings.map((listing) => (
                  <VerifiedListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {olderListings.length > 0 ? (
                <div
                  className={
                    canScrollNext
                      ? "listings-carousel can-scroll-next"
                      : "listings-carousel"
                  }
                >
                  <div
                    className="listings-track"
                    ref={listingsTrackRef}
                    onScroll={updateListingsScroll}
                  >
                    {olderListings.map((listing) => (
                      <div key={listing.id} className="listing-card-slide">
                        <VerifiedListingCard listing={listing} />
                      </div>
                    ))}
                  </div>

                  {canScrollNext ? (
                    <button
                      type="button"
                      className="listings-next-btn"
                      onClick={scrollListingsNext}
                      aria-label="Show more verified listings"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="service-areas">
        <div className="service-areas-inner">
          <div className="service-areas-head">
            <div className="service-areas-eyebrow">Where we cover</div>
            <h2 className="service-areas-title">Service Areas</h2>
          </div>
          <div className="service-areas-grid">
            {SERVICE_AREAS.map((area) => (
              <article key={area.name} className="service-area-card">
                <Link
                  href={buildSearchHref({ area: area.name })}
                  className="service-area-name"
                >
                  {area.name}
                </Link>
                <div className="service-area-map">
                  <iframe
                    title={`Map of ${area.name}, Kathmandu`}
                    src={mapEmbedSrc(area)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {newsItems.length > 0 ? (
        <section className="home-news">
          <div className="home-news-inner">
            <div className="home-news-head">
              <div className="home-news-eyebrow">Latest updates</div>
              <div className="home-news-title-row">
                <h2 className="home-news-title">News</h2>
                <Link href="/news" className="home-news-all-link">
                  All News
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>

            <div
              className={`home-news-carousel${canScrollNewsNext ? " can-scroll-next" : ""}${canScrollNewsPrev ? " can-scroll-prev" : ""}`}
            >
              {canScrollNewsPrev ? (
                <button
                  type="button"
                  className="home-news-nav home-news-nav-prev"
                  onClick={() => scrollNewsBy(-1)}
                  aria-label="Previous news"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
              ) : null}

              <div
                className="home-news-track"
                ref={newsTrackRef}
                onScroll={updateNewsScroll}
              >
                {newsItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="home-news-slide"
                  >
                    <article className="home-news-card">
                      <div className="home-news-photo">
                        {item.image_path ? (
                          <Image
                            src={item.image_path}
                            alt={item.heading || "News"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 900px) 45vw, 20vw"
                          />
                        ) : (
                          <div className="home-news-photo-empty">News</div>
                        )}
                      </div>
                      <h3 className="home-news-heading">
                        {item.heading || "Untitled"}
                      </h3>
                    </article>
                  </Link>
                ))}
              </div>

              {canScrollNewsNext ? (
                <button
                  type="button"
                  className="home-news-nav home-news-nav-next"
                  onClick={() => scrollNewsBy(1)}
                  aria-label="Next news"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
