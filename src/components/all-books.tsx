"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  LibraryBigIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  SparklesIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL, ApiError, apiFetch, type Book } from "@/lib/api";

type LoadState = "loading" | "ready" | "error";

function availability(book: Book) {
  const available = Number(book.availableCopies ?? 0);
  const total = Number(book.totalCopies ?? 0);
  return {
    available: Number.isFinite(available) ? available : 0,
    total: Number.isFinite(total) ? total : 0,
  };
}

function BookCover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false);
  const image = book.image?.trim();

  if (!image || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(160deg,#f4f0ff_0%,#ece5fe_55%,#e3dafc_100%)] px-6 text-center">
        <BookOpenIcon className="size-9 text-brand/45" />
        <p className="line-clamp-2 text-xs font-semibold text-brand/70">
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
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}

function BookCard({ book }: { book: Book }) {
  const { available, total } = availability(book);
  const isAvailable = available > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_28px_60px_-40px_rgba(47,44,61,0.5)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-tint">
        <BookCover book={book} />
        {book.category ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-brand uppercase shadow-sm backdrop-blur">
            {book.category}
          </span>
        ) : null}
      </div>

     <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h2 className="line-clamp-2 text-sm leading-snug font-bold text-ink sm:text-[15px]">
          {book.title}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-ink-muted sm:text-xs">
          by {book.author}
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-ink-muted sm:mt-2.5 sm:text-xs sm:leading-5">
          {book.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 sm:gap-3 sm:pt-3.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-semibold sm:text-[11px]",
              isAvailable ? "text-emerald-600" : "text-rose-500"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                isAvailable ? "bg-emerald-500" : "bg-rose-400"
              )}
            />
            {isAvailable ? "Available" : "Out of stock"}
          </span>
          <span
            aria-label={`${available} of ${total} copies`}
            className="text-[10px] font-medium whitespace-nowrap text-ink-muted tabular-nums sm:text-[11px]"
          >
            {available} / {total} copies
          </span>
        </div>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-[3/4] animate-pulse bg-brand-tint" />
      <div className="space-y-3 p-3.5 sm:p-4">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-line" />
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-line" />
        <div className="h-3 w-full animate-pulse rounded-full bg-line" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-line" />
      </div>
    </div>
  );
}

export function AllBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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
          return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
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
                : "The shelves could not be loaded right now."
        );
        setState("error");
      });

    return () => controller.abort();
  }, [reloadKey]);

  function retry() {
    setState("loading");
    setError(null);
    setReloadKey((key) => key + 1);
  }

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        books
          .map((book) => book.category?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [books]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory = category === "All" || book.category === category;
      if (!matchesCategory) return false;
      if (!term) return true;

      return [book.title, book.author, book.category, book.description].some(
        (value) => value?.toLowerCase().includes(term)
      );
    });
  }, [books, search, category]);

  const availableCount = useMemo(
    () => books.filter((book) => availability(book).available > 0).length,
    [books]
  );

  const hasFilters = search.trim().length > 0 || category !== "All";

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_18px_45px_-50px_rgba(47,44,61,0.55)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, author, or category"
              aria-label="Search books"
              className="h-11 rounded-full border-line bg-[#faf9fc] pr-10 pl-10 text-sm shadow-none placeholder:text-ink-muted/60 focus-visible:border-brand focus-visible:bg-white focus-visible:ring-brand/15"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-ink/5 hover:text-ink focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none",
                    active
                      ? "border-brand bg-brand text-white shadow-[0_8px_20px_-12px_rgba(138,110,232,0.9)]"
                      : "border-line bg-white text-ink-muted hover:border-brand/30 hover:text-brand"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-medium text-ink-muted">
          {state === "ready" ? (
            <>
              Showing <span className="font-bold text-ink">{filtered.length}</span>{" "}
              of <span className="font-bold text-ink">{books.length}</span>{" "}
              {books.length === 1 ? "book" : "books"}
            </>
          ) : state === "loading" ? (
            "Loading the shelves..."
          ) : (
            "The shelves are unavailable"
          )}
        </p>
        {state === "ready" && books.length > 0 ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <SparklesIcon className="size-3.5" />
            {availableCount} ready to borrow
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        {state === "loading" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="rounded-3xl border border-destructive/15 bg-destructive/5 px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-destructive shadow-sm">
              <TriangleAlertIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              We could not load the shelves
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
            <p className="mt-4 text-[11px] text-ink-muted/70">
              {API_URL}/books
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-brand-tint/70 px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <LibraryBigIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              The shelves are waiting for their first story
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
              No books have been added yet. Be the first to share one with the
              nook.
            </p>
            <Link
              href="/books/add"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-10 gap-2 rounded-full px-5"
              )}
            >
              Add the first book
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-brand-tint/70 px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <SearchXIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              No books match that search
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
              Try a different title, author, or category.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 h-10 gap-2 rounded-full border-line px-5"
            >
              <XIcon className="size-4" />
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
            {hasFilters ? (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="h-9 gap-2 rounded-full px-4 text-ink-muted"
                >
                  <XIcon className="size-3.5" />
                  Clear filters
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
