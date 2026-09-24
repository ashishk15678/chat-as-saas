import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { ThemeToggle } from "@/components/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";

export async function Topbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border px-5 backdrop-blur-xl">
      <Link href="/dashboard" className="font-semibold lg:hidden">
        Chatline
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account" />}>
              <Avatar className="size-7">
                <AvatarImage src={user?.image ?? undefined} alt="" />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>Settings</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/billing" />}>Plan and usage</DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
