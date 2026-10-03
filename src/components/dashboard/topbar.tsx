import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";
import { MobileNav } from "./mobile-nav";

export async function Topbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-5">
      {/* Mobile: hamburger drawer + app name. Hidden once sidebar is visible (lg+) */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <Link href="/dashboard" className="font-semibold tracking-[-0.04em]">
          Chatline
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Account"
              />
            }
          >
            <Avatar className="size-7">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? ""}
              />
              <AvatarFallback className="bg-accent text-[11px] font-semibold text-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
              Plan & usage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
