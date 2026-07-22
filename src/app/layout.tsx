import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
} from "next/font/google";
import { SiteFooterGate } from "@/components/SiteFooterGate";
import "./globals.css";
import "./home-design.css";
import "./search-browse.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const homeSans = Inter({
  variable: "--font-home-sans",
  subsets: ["latin"],
});

const homeSerif = Fraunces({
  variable: "--font-home-serif",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BUILT Himalayas | Premium Rentals",
  description:
    "Browse and list premium rental homes across Kathmandu Valley.",
  applicationName: "BUILT Himalayas",
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      {
        url: "/android-chrome-192x192.png?v=2",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png?v=2",
        sizes: "512x512",
        type: "image/png",
      },
      { url: "/favicon.ico?v=2", sizes: "48x48" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png?v=2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico?v=2"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: false,
    title: "BUILT Himalayas",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#153350",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${homeSans.variable} ${homeSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <SiteFooterGate />
      </body>
    </html>
  );
}
