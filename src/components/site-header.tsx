"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookmarkIcon,
  ChevronDownIcon,
  HeartIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { cn } from "cn";

import { useAuth } from "@/components/auth-provider";
import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  private?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Add Book", href: "/add-book", private: true },
  { label: "My Books", href: "/my-books", private: true },
  { label: "My Borrows", href: "/my-borrows", private: true },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserAvatar({
  size = "default",
  className,
}: {
  size?: "default" | "lg";
  className?: string;
}) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Avatar size={size} className={cn("bg-brand-soft", className)}>
      {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
      <AvatarFallback className="bg-brand-soft text-xs font-bold text-brand">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function UserMenu({ align = "end" }: { align?: "start" | "end" }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="group flex items-center gap-1.5 rounded-full outline-none transition focus-visible:ring-4 focus-visible:ring-brand/20 data-popup-open:ring-4 data-popup-open:ring-brand/15"
      >
        <UserAvatar className="size-9 ring-2 ring-brand-soft ring-offset-2 ring-offset-white transition group-hover:ring-brand/30 group-data-popup-open:ring-brand/40" />
        <ChevronDownIcon className="size-4 text-ink-muted transition group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} sideOffset={10} className="w-64 p-1.5">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserAvatar className="size-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href="/profile" />}
          className="gap-2.5 px-2.5 py-2 text-[13px] font-semibold text-ink"
        >
          <UserRoundIcon className="size-4 text-ink-muted" />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="gap-2.5 px-2.5 py-2 text-[13px] font-semibold"
        >
          <LogOutIcon className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 rounded-full px-4 text-[15px] font-semibold text-ink hover:bg-brand-tint hover:text-brand"
        )}
      >
        Login
      </Link>
      <Link
        href="/register"
        className={cn(
          buttonVariants(),
          "h-10 rounded-full bg-gradient-to-r from-[#9a7bf1] to-[#7a5bdf] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(122,91,223,0.75)] transition hover:from-[#8f6fe9] hover:to-[#6d4fd4] hover:shadow-[0_10px_24px_-8px_rgba(122,91,223,0.9)]"
        )}
      >
        Register
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.private || user);

  return (
    <header className="sticky top-0 z-50 border-b border-line/90 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid h-[84px] max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:h-[96px] lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Link
          href="/"
          aria-label="BookNook home"
          className="w-fit rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
        >
          <BrandLogo
            markClassName="size-9 sm:size-10"
            wordmarkClassName="text-[27px] sm:text-[30px] lg:text-[32px]"
          />
        </Link>

        <nav aria-label="Main" className="hidden justify-self-center lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center text-[15px] font-semibold tracking-[-0.01em] transition-colors outline-none focus-visible:text-brand",
                      isActive
                        ? "text-brand"
                        : "text-ink hover:text-brand"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end">
          <div className="hidden items-center lg:flex">
            {!hydrated ? (
              <div
                aria-hidden="true"
                className="h-10 w-[190px] animate-pulse rounded-full bg-muted"
              />
            ) : user ? (
              <UserMenu />
            ) : (
              <AuthButtons />
            )}
          </div>

          {hydrated && user ? (
            <div className="mr-2 lg:hidden">
              <UserMenu />
            </div>
          ) : null}

          <div className="flex items-center lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Open menu"
                    className="size-10 rounded-full text-ink hover:bg-brand-tint"
                  />
                }
              >
                <MenuIcon className="size-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[320px] gap-0 p-0 sm:max-w-sm"
              >
                <SheetTitle className="sr-only">BookNook menu</SheetTitle>

                <div className="flex h-20 items-center border-b border-line pr-14 pl-5">
                  <Link href="/" onClick={() => setMenuOpen(false)}>
                    <BrandLogo
                      markClassName="size-8"
                      wordmarkClassName="text-[24px]"
                    />
                  </Link>
                </div>

                <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
                  <ul className="flex flex-col gap-1">
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
                              isActive
                                ? "bg-brand-soft text-brand"
                                : "text-ink hover:bg-brand-tint hover:text-brand"
                            )}
                          >
                            {item.private ? (
                              <span className="text-ink-muted">
                                {item.href === "/add-book" ? (
                                  <PlusIcon className="size-4" />
                                ) : item.href === "/my-books" ? (
                                  <BookmarkIcon className="size-4" />
                                ) : (
                                  <HeartIcon className="size-4" />
                                )}
                              </span>
                            ) : null}
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-auto border-t border-line p-5">
                  {!hydrated ? (
                    <div
                      aria-hidden="true"
                      className="h-20 w-full animate-pulse rounded-2xl bg-muted"
                    />
                  ) : user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl bg-brand-tint p-3 transition hover:bg-brand-soft"
                      >
                        <UserAvatar size="lg" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {user.email}
                          </p>
                        </div>
                        <UserRoundIcon className="size-4 shrink-0 text-ink-muted" />
                      </Link>

                      <Button
                        variant="destructive"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          router.push("/");
                        }}
                        className="mt-3 h-11 w-full justify-center rounded-full text-sm font-semibold"
                      >
                        <LogOutIcon className="size-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <AuthButtons className="flex-col items-stretch gap-2" />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
