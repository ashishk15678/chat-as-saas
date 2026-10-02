import type { Metadata } from "next";

// Tell Next.js not to add its default X-Frame-Options / CSP for embed pages.
// The actual DENY/ALLOW headers are set in next.config.ts headers() for /embed/*.
export const metadata: Metadata = {
  // Disable the built-in frame protection for embed routes
  other: {
    // CSP meta tag as belt-and-suspenders: allow framing from anywhere.
    // Real enforcement is via the HTTP header in next.config.ts.
    "Content-Security-Policy": "frame-ancestors *",
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="m-0 overflow-hidden bg-transparent p-0">{children}</body>
  );
}
