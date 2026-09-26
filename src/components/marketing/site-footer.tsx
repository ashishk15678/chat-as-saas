import Link from "next/link";
import { APP } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["Pricing", "/pricing"],
      ["Docs", "/docs"],
      ["Status", "/status"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Refunds", "/refunds"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            {APP.name}
          </div>
          <p className="text-muted-foreground max-w-xs text-sm">
            {APP.tagline}
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mx-auto max-w-6xl border-t border-border px-5 py-6 text-xs">
        © {new Date().getFullYear()} {APP.name}. Payments processed by Razorpay.
        Prices include GST.
      </div>
    </footer>
  );
}
