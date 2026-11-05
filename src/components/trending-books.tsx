"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookmarkPlusIcon,
  BookOpenIcon,
  RefreshCwIcon,
  StarIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "cn";

import { Button, buttonVariants } from "@/components/ui/button";
import { API_URL, ApiError, apiFetch, type Book } from "@/lib/api";

type LoadState = "loading" | "ready" | "error";

function copiesOf(book: Book) {
  const available = Number(book.availableCopies ?? 0);
  return Number.isFinite(available) ? available : 0;
}

function Cover({
  book,
  eager = false,
}: {
  book: Book;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const image = book.image?.trim();

  if (!image || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(160deg,#f4f0ff_0%,#ece5fe_55%,#e3dafc_100%)] px-4 text-center">
        <BookOpenIcon className="size-8 text-brand/40" />
        <p className="line-clamp-3 text-[11px] font-semibold text-brand/70">
          {book.title}
        </p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={`${book.title} cover`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function FeaturedBook({ book }: { book: Book }) {
  const available = copiesOf(book);

  return (
    <div className="mx-auto w-full max-w-[320px] lg:mx-0">
      <div className="bg-white p-2.5 shadow-[0_30px_60px_-45px_rgba(47,44,61,0.55)] ring-1 ring-black/[0.06]">
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-tint">
          <Cover book={book} eager />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div
          role="img"
          aria-label="A reader favorite"
          className="flex items-center gap-0.5 text-amber-500"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon key={index} className="size-3.5 fill-current" />
          ))}
        </div>
        <p
          className={cn(
            "text-sm font-semibold",
            available > 0 ? "text-ink" : "text-rose-500"
          )}
        >
          {available > 0
            ? `${available} ${available === 1 ? "copy" : "copies"}`
            : "Out of stock"}
        </p>
      </div>

      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
        {book.title}
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        {book.author}
        <span aria-hidden="true" className="mx-2 text-ink/25">
          ·
        </span>
        {book.category}
      </p>

      <Link
        href="/books"
        className="mt-5 inline-flex h-11 items-center gap-2 border-2 border-ink bg-white px-6 text-[11px] font-bold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-ink hover:text-white focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
      >
        <BookmarkPlusIcon className="size-4" />
        Borrow Now
      </Link>
    </div>
  );
}

function TrendingCard({ book, badge }: { book: Book; badge?: boolean }) {
  const available = copiesOf(book);

  return (
    <article className="group">
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden bg-white p-1.5 shadow-[0_18px_40px_-32px_rgba(47,44,61,0.5)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-32px_rgba(47,44,61,0.55)]">
          <div className="relative h-full w-full overflow-hidden bg-brand-tint">
            <Cover book={book} />
          </div>
        </div>

        {badge ? (
          <span className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-[#c55b5b] text-[8px] font-bold tracking-[0.06em] text-white uppercase shadow-[0_6px_14px_-6px_rgba(120,40,40,0.8)] sm:size-9 sm:text-[9px]">
            New
          </span>
        ) : null}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 text-[9px] font-semibold tracking-[0.08em] text-ink-muted uppercase sm:text-[10px]">
        <span className="truncate">{book.category}</span>
        <span
          className={cn(
            "shrink-0",
            available > 0 ? "text-emerald-600" : "text-rose-500"
          )}
        >
          {available > 0 ? `${available} left` : "Out"}
        </span>
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-sm leading-snug font-medium text-ink">
        <Link
          href="/books"
          className="underline decoration-ink/25 decoration-1 underline-offset-4 transition-colors hover:text-brand focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
        >
          {book.title}
        </Link>
      </h3>

      <Link
        href="/books"
        className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.12em] text-ink uppercase underline decoration-ink/40 underline-offset-4 transition-colors hover:text-brand focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none sm:text-[10px]"
      >
        <BookmarkPlusIcon className="size-3.5" />
        Borrow
      </Link>
    </article>
  );
}

function SectionSkeleton() {
  return (
    <section className="bg-white py-16 lg:py-24" aria-busy="true">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14 lg:px-10 xl:gap-20">
        <div className="mx-auto w-full max-w-[320px] lg:mx-0">
          <div className="aspect-[3/4] animate-pulse bg-brand-tint" />
          <div className="mt-6 h-3 w-24 animate-pulse rounded-full bg-line" />
          <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-line" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-line" />
          <div className="mt-6 h-11 w-36 animate-pulse rounded-sm bg-line" />
        </div>

        <div>
          <div className="h-8 w-64 animate-pulse rounded-full bg-line" />
          <div className="mt-3 h-3 w-80 max-w-full animate-pulse rounded-full bg-line" />
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index}>
                <div className="aspect-[3/4] animate-pulse bg-brand-tint" />
                <div className="mt-3 h-2.5 w-3/5 animate-pulse rounded-full bg-line" />
                <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded-full bg-line" />
                <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded-full bg-line" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrendingBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<Book[]>("/books", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) {
          throw new Error("The API returned an unexpected response.");
        }

        const sorted = [...data].sort((a, b) => {
          const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
          const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
          return (
            (Number.isNaN(timeB) ? 0 : timeB) -
            (Number.isNaN(timeA) ? 0 : timeA)
          );
        });

        setBooks(sorted);
        setState("ready");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof TypeError
            ? `Could not reach the BookNook API at ${API_URL}. Make sure the server is running.`
            : cause instanceof ApiError
              ? cause.message
              : cause instanceof Error && cause.message
                ? cause.message
                : "The trending shelf could not be loaded."
        );
        setState("error");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const { featured, trending } = useMemo(
    () => ({
      featured: books[0] ?? null,
      trending: books.slice(1, 10),
    }),
    [books]
  );

  function retry() {
    setState("loading");
    setError(null);
    setReloadKey((key) => key + 1);
  }

  if (state === "loading") return <SectionSkeleton />;

  if (state === "error") {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
          <div className="rounded-3xl border border-destructive/15 bg-destructive/5 px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-destructive shadow-sm">
              <TriangleAlertIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              We could not load the trending shelf
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
              {error}
            </p>
            <Button
              type="button"
              onClick={retry}
              className="mt-6 h-10 gap-2 rounded-full px-5"
            >
              <RefreshCwIcon className="size-4" />
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!featured) {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
          <div className="rounded-3xl border border-dashed border-line bg-brand-tint/70 px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <BookOpenIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              The shelves are waiting for their first story
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
              Add a book to the nook and it will show up here for everyone to
              find.
            </p>
            <Link
              href="/add-book"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-10 gap-2 rounded-full px-5"
              )}
            >
              Add the first book
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="trending-heading"
      className="bg-white py-16 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14 lg:px-10 xl:gap-20">
        <FeaturedBook key={featured._id} book={featured} />

        <div>
          <h2
            id="trending-heading"
            className="text-[28px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[34px]"
          >
            Top Trending Books
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            The stories our readers are reaching for this month, pulled fresh
            from the BookNook shelves.
          </p>

          {trending.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6">
              {trending.map((book, index) => (
                <TrendingCard
                  key={book._id}
                  book={book}
                  badge={index < 3}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-line bg-brand-tint/60 px-5 py-10 text-center text-sm text-ink-muted">
              More books are on their way to the shelves.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
