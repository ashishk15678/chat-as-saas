"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { APP } from "@/lib/constants";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#sources", label: "Your content" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-background/30 sticky top-0 z-50 border-b border-border backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-[-0.02em]"
        >
          {APP.name}
        </Link>
        <div className="hidden items-center gap-6 md:flex">
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
          <ThemeToggle />
          <Button
            render={<Link href="/login" />}
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Sign in
          </Button>
          <Button render={<Link href="/signup" />} size="sm" className="press">
            Start free
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </nav>
      {open && (
        <div className="space-y-1 border-t px-5 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
