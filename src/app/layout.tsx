import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme";
import { TRPCReactProvider } from "@/trpc/client";
import { APP } from "@/lib/constants";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";

const sans = GeistSans;
const mono = GeistMono;

export const metadata: Metadata = {
  title: {
    default: `${APP.name}`,
    template: `%s · ${APP.name}`,
  },
  description: `${APP.tagline} .Upload your documents, embed one line of script, and answer customer questions on your site around the clock.`,
  metadataBase: new URL(APP.url),
  openGraph: { type: "website", siteName: APP.name },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
