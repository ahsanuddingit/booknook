"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  CalendarClockIcon,
  Loader2Icon,
  Undo2Icon,
} from "lucide-react";
import { format } from "date-fns";

import { ApiError, apiFetch, API_URL } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { EmptyState } from "@/components/page-shell";

type BorrowRecord = {
  _id: string;
  bookId: string;
  bookTitle?: string;
  bookImage?: string;
  userEmail?: string;
  borrowDate?: string;
  returnDate?: string;
};

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
}

export function MyBorrowsTable() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchBorrows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<BorrowRecord[]>("/borrows");
      setBorrows(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Your session could not be verified. Sign in again and retry."
            : err.message
        );
      } else if (err instanceof TypeError) {
        setError(
          `Could not reach the BookNook API at ${API_URL}. Make sure the server is running.`
        );
      } else {
        setError("Something went wrong while loading your borrows.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows, reloadKey]);

  const handleReturn = async (record: BorrowRecord) => {
    try {
      setReturningId(record._id);
      await apiFetch(`/borrows/${record._id}`, { method: "DELETE" });

      setBorrows((prev) => prev.filter((entry) => entry._id !== record._id));
      showToast.success(`“${record.bookTitle ?? "Book"}” was returned.`);
    } catch (err: unknown) {
      showToast.error(
        err instanceof ApiError
          ? err.message
          : "Could not return the book. Please try again."
      );
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl bg-brand-tint" />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((n) => n + 1)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  if (borrows.length === 0) {
    return (
      <EmptyState
        icon={<BookOpenIcon className="size-5" />}
        title="Nothing borrowed yet"
        description="When you borrow a book, it will show up here with its due date."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Book Title</th>
            <th className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <CalendarClockIcon className="size-3.5" />
                Borrow Date
              </span>
            </th>
            <th className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <CalendarClockIcon className="size-3.5" />
                Return Date
              </span>
            </th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((record) => (
            <tr
              key={record._id}
              className="border-b border-line/70 transition last:border-0 hover:bg-brand-tint/60"
            >
              <td className="px-4 py-3">
                {record.bookImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={record.bookImage}
                    alt=""
                    loading="lazy"
                    className="h-16 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <BookOpenIcon className="size-4" />
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/books/${record.bookId}`}
                  className="font-semibold text-ink hover:text-brand"
                >
                  {record.bookTitle || "Untitled"}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-ink-muted">
                {formatDate(record.borrowDate)}
              </td>
              <td className="px-4 py-3 text-sm text-ink-muted">
                {formatDate(record.returnDate)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleReturn(record)}
                  disabled={returningId === record._id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  {returningId === record._id ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Returning...
                    </>
                  ) : (
                    <>
                      <Undo2Icon className="size-3.5" />
                      Return Book
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
