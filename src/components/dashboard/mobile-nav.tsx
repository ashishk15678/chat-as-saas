"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bot, CreditCard, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP } from "@/lib/constants";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard",          label: "Overview",     icon: LayoutGrid, exact: true },
  { href: "/dashboard/chatbots", label: "Chatbots",     icon: Bot },
  { href: "/dashboard/billing",  label: "Plan & usage", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings",     icon: Settings },
];

function Px() {
  return (
    <div className="pixel-deco shrink-0">
      <span /><span /><span /><span />
    </div>
  );
}

export function MobileNavToggle() {
  return null; // Rendered inside MobileNav — exported for topbar import
}

/** Full mobile drawer nav — rendered as part of topbar on small screens */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Hamburger — only visible on < lg */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <Px />
            <span className="text-[15px] font-semibold tracking-[-0.04em]">{APP.name}</span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <p className="eyebrow mb-2 px-2">Workspace</p>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-[15px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
