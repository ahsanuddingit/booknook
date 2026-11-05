import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon, HomeIcon } from "lucide-react";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-5 py-24 sm:px-8 lg:px-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-9 text-center shadow-[0_24px_70px_-40px_rgba(47,44,61,0.35)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <BookOpenIcon className="size-7" />
        </div>
        <p className="mt-6 text-[64px] font-extrabold leading-none tracking-[-0.04em] text-ink">
          404
        </p>
        <h1 className="mt-4 text-xl font-extrabold tracking-[-0.02em] text-ink">
          This page is off the shelf
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-muted">
          The page you are looking for was moved, removed, or never existed in
          the BookNook catalog.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <HomeIcon className="size-4" />
          Back to Home
        </Link>
      </div>
    </section>
  );
}
