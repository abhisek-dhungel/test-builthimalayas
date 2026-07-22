"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

type FavoriteButtonProps = {
  listingId: number;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({
  listingId,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/favorites/ids?ids=${listingId}`, {
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!cancelled) {
          setFavorited(
            Array.isArray(data.ids) && data.ids.includes(listingId),
          );
        }
      } catch {
        // Keep default unfavorited state if check fails
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (favorited) {
        const res = await fetch(`/api/favorites?listing_id=${listingId}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        if (res.ok) setFavorited(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ listing_id: listingId }),
        });
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        if (res.ok) setFavorited(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonPad = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      disabled={loading}
      aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${buttonPad} transition hover:bg-[var(--surface-muted)] disabled:opacity-70 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${iconSize} ${favorited ? "fill-[var(--primary)] text-[var(--primary)]" : "fill-none text-[var(--secondary)]"}`}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
        />
      </svg>
    </button>
  );
}
