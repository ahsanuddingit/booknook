import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CurrentYear } from "@/components/current-year";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Add a Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
];

const ACCOUNT_LINKS = [
  { label: "My Profile", href: "/profile" },
  { label: "My Borrows", href: "/my-borrows" },
  { label: "Login", href: "/login" },
  { label: "Create an account", href: "/register" },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M14 8.5h2.2V5.6c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.1v2.6H5.5v3.2h2.7V24h3.7v-7.7h2.9l.4-3.2h-3.3v-2.3c0-1.3.4-2.3 2.1-2.3Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 5.8c2 0 2.2 0 3 .1.7 0 1.1.1 1.4.3.4.1.6.3.9.6.3.3.5.5.6.9.1.3.2.7.3 1.4 0 .8.1 1 .1 3s0 2.2-.1 3c0 .7-.1 1.1-.3 1.4-.1.4-.3.6-.6.9-.3.3-.5.5-.9.6-.3.1-.7.2-1.4.3-.8 0-1 .1-3 .1s-2.2 0-3-.1c-.7 0-1.1-.1-1.4-.3-.4-.1-.6-.3-.9-.6-.3-.3-.5-.5-.6-.9-.1-.3-.2-.7-.3-1.4 0-.8-.1-1-.1-3s0-2.2.1-3c0-.7.1-1.1.3-1.4.1-.4.3-.6.6-.9.3-.3.5-.5.9-.6.3-.1.7-.2 1.4-.3.8 0 1-.1 3-.1ZM12 4c-2 0-2.3 0-3.1.1-.8 0-1.4.2-1.9.4-.5.2-1 .5-1.4.9-.4.4-.7.9-.9 1.4-.2.5-.4 1.1-.4 1.9C4.2 9.7 4.1 10 4.1 12s0 2.3.1 3.1c0 .8.2 1.4.4 1.9.2.5.5 1 .9 1.4.4.4.9.7 1.4.9.5.2 1.1.4 1.9.4.8.1 1.1.1 3.1.1s2.3 0 3.1-.1c.8 0 1.4-.2 1.9-.4.5-.2 1-.5 1.4-.9.4-.4.7-.9.9-1.4.2-.5.4-1.1.4-1.9.1-.8.1-1.1.1-3.1s0-2.3-.1-3.1c0-.8-.2-1.4-.4-1.9-.2-.5-.5-1-.9-1.4-.4-.4-.9-.7-1.4-.9-.5-.2-1.1-.4-1.9-.4C14.3 4 14 4 12 4Zm0 5.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Zm4.6-6a.8.8 0 1 1-1.7 0 .8.8 0 0 1 1.7 0Z",
  },
  {
    label: "X",
    href: "https://x.com",
    path: "M17.4 4h3l-6.6 7.6L21.6 20h-6.1l-4.8-6.3L5.2 20h-3l7-8.1L4.1 4h6.2l4.3 5.7L17.4 4Zm-1.1 14.3h1.7L7.6 5.6H5.8l10.5 12.7Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M6.3 8.8H3.4V21h2.9V8.8Zm.2-3.4A1.7 1.7 0 1 0 3 5.4a1.7 1.7 0 0 0 3.5 0ZM21 14.2c0-3.3-1.8-4.9-4.2-4.9-1.9 0-2.8 1.1-3.3 1.9V8.8H10.6V21h2.9v-6.4c0-1.7.7-2.7 2.1-2.7 1.3 0 1.9.9 1.9 2.7V21H21v-6.8Z",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#17131f] text-white/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-96 rounded-full bg-[#8a6ee8]/20 blur-[110px]"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.4fr] lg:gap-10">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="BookNook home"
              className="w-fit rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              <BrandLogo
                tone="light"
                markClassName="size-10"
                wordmarkClassName="text-[28px]"
              />
            </Link>

            <p className="mt-5 text-[15px] leading-7">
              A cozy corner for readers. Discover new stories, lend the books
              you love, and keep every borrow in one place.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white/10 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-[15px]"
                    fill="currentColor"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />

          <div>
            <h2 className="text-sm font-bold tracking-[0.14em] text-white/90 uppercase">
              Contact
            </h2>
            <ul className="mt-5 space-y-3.5 text-[15px]">
              <li>
                <a
                  href="mailto:hello@booknook.com"
                  className="flex items-start gap-3 transition hover:text-white"
                >
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                  hello@booknook.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+11234567890"
                  className="flex items-start gap-3 transition hover:text-white"
                >
                  <PhoneIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                  +1 (123) 456-7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>
                  42 Maple Street
                  <br />
                  Portland, OR 97205
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> BookNook. All rights reserved.
          </p>
          <p className="text-white/40">Made for readers, one page at a time.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-bold tracking-[0.14em] text-white/90 uppercase">
        {title}
      </h2>
      <ul className="mt-5 space-y-3 text-[15px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
