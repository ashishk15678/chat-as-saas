import { ThemeProvider } from "@/components/theme";

// The landing page ships its own nav and footer inline.
// The layout only provides the ThemeProvider wrapper.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <main>{children}</main>
    </ThemeProvider>
  );
}
