import "@/styles/globals.css";

/** The embed renders outside the app shell: no nav, no providers, no analytics. */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent">{children}</body>
    </html>
  );
}
