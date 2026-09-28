"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Bot, CreditCard, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP } from "@/lib/constants";
import { signOut } from "@/lib/auth-client";

function Px() {
  return (
    <div className="pixel-deco shrink-0">
      <span /><span /><span /><span />
    </div>
  );
}

const NAV = [
  { href: "/dashboard",          label: "Overview",       icon: LayoutGrid, exact: true },
  { href: "/dashboard/chatbots", label: "Chatbots",       icon: Bot },
  { href: "/dashboard/billing",  label: "Plan & usage",   icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings",       icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <Px />
        <span className="text-[15px] font-semibold tracking-[-0.04em]">{APP.name}</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        <p className="eyebrow mb-2 px-2">Workspace</p>
        <div className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
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
        </div>
      </nav>

      {/* Sign-out */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
