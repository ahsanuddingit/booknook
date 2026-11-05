"use client";

/**
 * Home-page shelf for one catalog category. Fetches the catalog through the
 * same-origin proxy, filters locally by category, and renders a card grid
 * where every card carries a "View Details" link to /books/<id>.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  FlaskConicalIcon,
  LandmarkIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "cn";

import { Button, buttonVariants } from "@/components/ui/button";
import { API_URL, ApiError, apiFetch, type Book } from "@/lib/api";

type LoadState = "loading" | "ready" | "error";

const CATEGORY_ICONS: Record<string, typeof BookOpenIcon> = {
  science: FlaskConicalIcon,
  history: LandmarkIcon,
};

const CATEGORY_BLURBS: Record<string, string> = {
  science: "Fresh investigations and discoveries",
  history: "The past, retold shelf by shelf",
};

function CategoryIcon({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category.toLowerCase()] ?? BookOpenIcon;
  return <Icon className="size-5" aria-hidden="true" />;
}

function matchCategory(book: Book, wanted: string) {
  return book.category?.trim().toLowerCase() === wanted.toLowerCase();
}

function Cover({ book }: { book: Book }) {
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
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function CategoryCard({ book, category }: { book: Book; category: string }) {
  const available = Number(book.availableCopies ?? 0);
  const hasCopies = Number.isFinite(available) && available > 0;

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white p-2.5 shadow-[0_18px_40px_-32px_rgba(47,44,61,0.5)] transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_28px_50px_-32px_rgba(47,44,61,0.55)]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-brand-tint">
        <Cover book={book} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[9px] font-semibold tracking-[0.08em] text-ink-muted uppercase sm:text-[10px]">
        <span className="truncate">{category}</span>
        <span className={cn("shrink-0", hasCopies ? "text-emerald-600" : "text-rose-500")}>
          {hasCopies ? `${available} left` : "Out"}
        </span>
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-sm leading-snug font-medium text-ink">
        {book.title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-ink-muted">{book.author}</p>

      <Link
        href={`/books/${book._id}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-3 w-full gap-2 rounded-full text-[10px] font-bold tracking-[0.08em] uppercase hover:border-brand hover:bg-brand/5 hover:text-brand"
        )}
      >
        <BookOpenIcon className="size-3.5" />
        View Details
      </Link>
    </article>
  );
}

function SectionSkeleton({ category }: { category: string }) {
  return (
    <section
      className="bg-[#f5f4f1] py-14 lg:py-18"
      aria-busy="true"
      aria-label={`${category} shelf loading`}
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="h-3 w-24 animate-pulse rounded-full bg-line" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-full bg-line" />
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-[3/4] animate-pulse rounded-xl bg-brand-tint" />
              <div className="mt-3 h-2.5 w-3/5 animate-pulse rounded-full bg-line" />
              <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded-full bg-line" />
              <div className="mt-3 h-8 w-full animate-pulse rounded-full bg-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryBooks({ category }: { category: string }) {
  const headingId = `category-${category.toLowerCase()}-heading`;
  const blurb = CATEGORY_BLURBS[category.toLowerCase()];

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
        setBooks(data.filter((book) => matchCategory(book, category)));
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
                : `The ${category.toLowerCase()} shelf could not be loaded.`
        );
        setState("error");
      });

    return () => controller.abort();
  }, [category, reloadKey]);

  const booksForCategory = useMemo(() => books, [books]);

  function retry() {
    setState("loading");
    setError(null);
    setReloadKey((key) => key + 1);
  }

  if (state === "loading") return <SectionSkeleton category={category} />;

  if (state === "error") {
    return (
      <section
        aria-labelledby={headingId}
        className="bg-[#f5f4f1] py-14 lg:py-18"
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
          <div className="rounded-3xl border border-destructive/15 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm">
              <TriangleAlertIcon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">
              We could not load the {category} shelf
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

  return (
    <section
      aria-labelledby={headingId}
      className="bg-[#f5f4f1] py-14 lg:py-18"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
          Featured collection
        </p>
        <h2
          id={headingId}
          className="mt-2 text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[30px]"
        >
          Our {category} collection
        </h2>
        {blurb ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            {blurb}
          </p>
        ) : null}

        {booksForCategory.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {booksForCategory.map((book) => (
              <CategoryCard key={book._id} book={book} category={category} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-line bg-white/70 px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand shadow-sm">
              <CategoryIcon category={category} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">
              The {category} shelf is empty for now
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
              Add a book to the {category} category and it will appear here.
            </p>
            <Link
              href="/add-book"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-10 gap-2 rounded-full px-5"
              )}
            >
              Add a {category.toLowerCase()} book
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
