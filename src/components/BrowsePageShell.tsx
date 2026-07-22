"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

export function BrowsePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="browse-page mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-10 lg:max-w-7xl lg:px-8 lg:py-10 xl:max-w-[1400px]">
      <div className="browse-hero-accent mb-6 rounded-2xl px-4 py-3 lg:mb-8 lg:px-5 lg:py-4">
        <ScrollReveal>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text)] lg:text-3xl">
                Available rentals
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] lg:text-base">
                Featured picks first, then listings by district.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-[var(--muted)] sm:text-xs">
                Not in list?
              </p>
              <Link
                href="/custom-order"
                className="browse-cta-btn mt-1 inline-block rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[11px] font-semibold text-white sm:text-xs"
              >
                Place custom order
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
      {children}
    </main>
  );
}
