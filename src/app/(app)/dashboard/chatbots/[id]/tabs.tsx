"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  ["", "Playground"],
  ["/sources", "Sources"],
  ["/conversations", "Conversations"],
  ["/analytics", "Analytics"],
  ["/embed", "Embed"],
  ["/settings", "Settings"],
] as const;

export function BotTabs({ id }: { id: string }) {
  const path = usePathname();
  const base = `/dashboard/chatbots/${id}`;

  return (
    <div className="border-border -mx-5 overflow-x-auto border-b px-5">
      <nav className="flex min-w-max gap-1">
        {TABS.map(([suffix, label]) => {
          const href = base + suffix;
          const active = path === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "relative px-3 py-2.5 text-sm transition-colors",
                active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {active && <span className="bg-primary absolute inset-x-2 -bottom-px h-0.5 rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
