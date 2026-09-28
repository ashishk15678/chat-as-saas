import Link from "next/link";
import { APP } from "@/lib/constants";

const COLS = [
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

function Px() {
  return (
    <div className="pixel-deco">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Px />
            <span className="text-[15px] font-semibold tracking-[-0.04em]">
              {APP.name}
            </span>
          </div>
          <p className="text-muted-foreground max-w-[200px] text-xs leading-5">
            {APP.tagline}
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="eyebrow">{col.title}</p>
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

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-t border-border px-5 py-5">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} {APP.name}. Payments processed by
          Razorpay. Prices include GST.
        </p>
        <p className="text-muted-foreground text-xs">
          Built for teams who ship.
        </p>
      </div>
    </footer>
  );
}
