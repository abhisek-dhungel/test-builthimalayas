"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";
import { SiteLogoLink } from "./BuiltLogo";

export function SiteHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "same-origin" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser, pathname]);

  async function logout() {
    await fetch("/api/user/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
    router.refresh();
  }

  return (
    <header className="site-header sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 xl:max-w-[1400px]">
        <SiteLogoLink size="sm" />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            aria-label="Search listings"
            title="Search listings"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </Link>

          <Link
            href={user ? "/favorites" : "/login?next=/favorites"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--secondary)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            aria-label="Favourites"
            title="Favourites"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
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
          </Link>

          {loaded && user ? (
            <>
              <span className="hidden max-w-[7rem] truncate text-xs font-medium text-[var(--muted)] sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--secondary)]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname || "/")}`}
              className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Login
            </Link>
          )}

          {showBack && (
            <Link
              href="/"
              className="rounded-full border border-[var(--border)] bg-[var(--support)] px-3 py-1.5 text-xs font-medium text-[var(--secondary)]"
            >
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
