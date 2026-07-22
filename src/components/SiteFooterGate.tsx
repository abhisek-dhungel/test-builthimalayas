"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

/** Shared site footer on all public pages (hidden on admin). */
export function SiteFooterGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return <SiteFooter />;
}
