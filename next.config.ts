import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Parent ~/package-lock.json otherwise makes Turbopack treat ~ as the app root → 404s
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Allow property video uploads (up to ~100MB) through route handlers (local/dev).
  // On Vercel, large videos go direct to Cloudinary from the browser.
  experimental: {
    proxyClientMaxBodySize: "105mb",
  },
};

export default nextConfig;
