"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { APP } from "@/lib/constants";

function PixelLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="pixel-deco">
        <span /><span /><span /><span />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.04em]">{APP.name}</span>
    </div>
  );
}

const LINKS = [
  { href: "/#how",     label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/docs",     label: "Docs" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label={`${APP.name} home`}>
          <PixelLogo />
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="press rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-colors hover:bg-accent hover:text-foreground"
          >
            Start free
          </Link>
          <button
            className="ml-1 flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              <Link href="/login" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface">Sign in</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
