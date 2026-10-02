import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // ── widget.js ────────────────────────────────────────────────────────
      // The script tag is loaded cross-origin from any customer site.
      // CORP + CORS headers let browsers (including those with COEP) fetch it.
      {
        source: "/widget.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=3600",
          },
        ],
      },

      // ── /embed/* ─────────────────────────────────────────────────────────
      // These pages are rendered inside a cross-origin <iframe>.
      // 1. Remove X-Frame-Options (Next.js default SAMEORIGIN blocks iframes).
      // 2. frame-ancestors * allows any site to embed (narrowed per-bot by allowedDomains at runtime).
      // 3. CORP cross-origin so the iframe's sub-resources load under COEP.
      {
        source: "/embed/:path*",
        headers: [
          // Explicitly unset X-Frame-Options so it doesn't block cross-origin iframes
          { key: "X-Frame-Options", value: "" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          // Allow microphone inside iframe (for future voice features)
          { key: "Permissions-Policy", value: "microphone=(self)" },
        ],
      },

      // ── /api/chat ────────────────────────────────────────────────────────
      // Preflight + actual CORS is handled in route.ts, but the OPTIONS
      // response also needs Cross-Origin-Resource-Policy at the edge level.
      {
        source: "/api/chat",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Headers",
            value: "content-type, x-visitor-hash",
          },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
