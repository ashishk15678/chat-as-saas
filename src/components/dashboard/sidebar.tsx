"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CreditCard, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP } from "@/lib/constants";
import { Button } from "../ui/button";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/dashboard/chatbots", label: "Chatbots", icon: Bot },
  { href: "/dashboard/billing", label: "Plan and usage", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="bg-sidebar hidden w-60 shrink-0 border-r border-border lg:flex lg:flex-col">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 px-5 font-semibold tracking-[-0.02em]"
      >
        {APP.name}
      </Link>
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Button
        className={
          " bg-red-500/10 hover:bg-red-500/30  text-red-500   mb-4 mx-2"
        }
      >
        Sign out
      </Button>
    </aside>
  );
}
