"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  XCircleIcon,
  BookmarkCheckIcon,
} from "lucide-react";

import { cn } from "cn";
import type { Book } from "@/lib/api";

function Cover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false);
  const image = book.image?.trim();

  if (!image || failed) {
    return (
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(160deg,#f4f0ff_0%,#ece5fe_55%,#e3dafc_100%)] px-6 text-center">
        <BookOpenIcon className="size-10 text-brand/45" />
        <p className="line-clamp-3 text-sm font-semibold text-brand/70">
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
      className="aspect-[3/4] w-full rounded-2xl object-cover shadow-[0_28px_60px_-40px_rgba(47,44,61,0.5)]"
    />
  );
}

export function BookDetail({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Borrow action states
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);
  const [borrowError, setBorrowError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/books/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Book not found");
        return res.json();
      })
      .then((data: Book) => setBook(data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error && cause.message
            ? cause.message
            : "Failed to load book details."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true);
    setBorrowError(null);

    try {
      const res = await fetch(`/api/books/${id}/borrow`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to process borrow request.");
      }

      setBorrowed(true);
    } catch (err: unknown) {
      setBorrowError(
        err instanceof Error ? err.message : "Could not borrow this book at the moment."
      );
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-brand-tint" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-line" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-line" />
          <div className="h-4 w-full animate-pulse rounded-full bg-line" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-line" />
          <div className="h-4 w-4/6 animate-pulse rounded-full bg-line" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="rounded-3xl border border-destructive/15 bg-destructive/5 px-6 py-14 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-destructive shadow-sm">
          <BookOpenIcon className="size-5" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">
          We could not find that book
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
          {error}
        </p>
        <Link
          href="/books"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <ArrowLeftIcon className="size-4" />
          Back to all books
        </Link>
      </div>
    );
  }

  const available = Number(book.availableCopies ?? 0);
  const total = Number(book.totalCopies ?? 0);
  const isAvailable = available > 0;

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
      <div className="mx-auto w-full max-w-[320px] lg:mx-0">
        <Cover book={book} />
      </div>

      <div className="flex flex-col">
        {book.category ? (
          <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-brand uppercase">
            {book.category}
          </span>
        ) : null}

        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
          {book.title}
        </h1>
        <p className="mt-2 text-[15px] font-medium text-ink-muted">
          by {book.author}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold",
              isAvailable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {isAvailable ? (
              <CheckCircle2Icon className="size-3.5" />
            ) : (
              <XCircleIcon className="size-3.5" />
            )}
            {isAvailable ? "Available to borrow" : "Out of stock"}
          </span>
          <span className="text-[12px] font-medium text-ink-muted tabular-nums">
            {available} / {total} copies
          </span>
          {book.userName ? (
            <span className="text-[12px] font-medium text-ink-muted">
              Shared by {book.userName}
            </span>
          ) : null}
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-sm font-bold tracking-[0.08em] text-ink-muted uppercase">
            About this book
          </h2>
          <p className="mt-3 text-[15px] leading-7 whitespace-pre-line text-ink-muted">
            {book.description}
          </p>
        </div>

        {/* Borrow System Action Area */}
        <div className="mt-8 rounded-2xl border border-line bg-brand-soft/30 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-ink">Ready to read?</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                {borrowed
                  ? "You have successfully borrowed this book."
                  : isAvailable
                  ? "Borrow a copy to add it to your reading list."
                  : "All copies are currently checked out."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBorrow}
              disabled={!isAvailable || borrowing || borrowed}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition shadow-sm",
                borrowed
                  ? "bg-emerald-600 cursor-default"
                  : !isAvailable
                  ? "bg-ink-muted/40 cursor-not-allowed"
                  : "bg-brand hover:bg-brand-dark"
              )}
            >
              {borrowed ? (
                <>
                  <BookmarkCheckIcon className="size-4" />
                  Borrowed Successfully
                </>
              ) : borrowing ? (
                "Processing..."
              ) : (
                "Borrow This Book"
              )}
            </button>
          </div>

          {borrowError && (
            <p className="mt-3 text-xs font-medium text-rose-600">
              {borrowError}
            </p>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-brand/30 hover:text-brand"
          >
            <ArrowLeftIcon className="size-4" />
            Back to all books
          </Link>
        </div>
      </div>
    </article>
  );
}