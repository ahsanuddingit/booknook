"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit3Icon,
  Loader2Icon,
  Trash2Icon,
  BookOpenIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { ApiError, apiFetch, API_URL, type Book } from "@/lib/api";
import { showToast } from "@/lib/toast";

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"] as const;

export function MyBooksClient() {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Edit modal state
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete modal state
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchMyBooks = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setError(null);
      // The Express API exposes the full catalog publicly; filter the books
      // added by the signed-in user on the client.
      const data = await apiFetch<Book[]>("/books");
      const email = user.email.toLowerCase();
      setBooks(
        data.filter((book) => (book.userEmail ?? "").toLowerCase() === email)
      );
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
        setError("Something went wrong while loading your books.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks, reloadKey]);

  // Handle Update Submission
  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBook) return;

    const bookId = editingBook._id;
    const formData = new FormData(event.currentTarget);
    const updatedData = {
      title: String(formData.get("title") ?? "").trim(),
      author: String(formData.get("author") ?? "").trim(),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? "").trim(),
      image: String(formData.get("image") ?? "").trim(),
    };

    try {
      setSubmittingEdit(true);
      await apiFetch(`/books/${bookId}`, {
        method: "PATCH",
        body: JSON.stringify(updatedData),
      });

      setBooks((prev) =>
        prev.map((book) =>
          book._id === bookId ? { ...book, ...updatedData } : book
        )
      );
      setEditingBook(null);
      showToast.success(`“${updatedData.title}” was updated successfully!`);
    } catch (err: unknown) {
      showToast.error(
        err instanceof ApiError
          ? err.message
          : "Error updating the book. Please try again."
      );
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Delete Execution
  const handleDeleteConfirm = async () => {
    if (!deletingBook) return;

    try {
      setSubmittingDelete(true);
      await apiFetch(`/books/${deletingBook._id}`, { method: "DELETE" });

      setBooks((prev) => prev.filter((book) => book._id !== deletingBook._id));
      showToast.success(`“${deletingBook.title}” was deleted.`);
      setDeletingBook(null);
    } catch (err: unknown) {
      showToast.error(
        err instanceof ApiError
          ? err.message
          : "Error deleting the book. Please try again."
      );
    } finally {
      setSubmittingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-64 animate-pulse rounded-2xl bg-brand-tint"
          />
        ))}
      </div>
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

  if (books.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-white p-12 text-center shadow-sm">
        <BookOpenIcon className="mx-auto mb-3 size-10 text-ink-muted" />
        <h3 className="text-lg font-bold text-ink">No books added yet</h3>
        <p className="mt-1 mb-6 text-sm text-ink-muted">
          You haven&apos;t added any books to the community catalog.
        </p>
        <Link
          href="/add-book"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Add Your First Book
        </Link>
      </div>
    );
  }

  const replaceInputClass =
    "w-full rounded-xl border border-line px-3.5 py-2 text-sm text-ink outline-none focus:border-brand";

  return (
    <>
      {/* Books Table (desktop) / Cards (mobile) */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Added by</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book._id}
                className="border-b border-line/70 transition last:border-0 hover:bg-brand-tint/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {book.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.image}
                        alt=""
                        loading="lazy"
                        className="h-14 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-10 items-center justify-center rounded-md bg-brand-soft text-brand">
                        <BookOpenIcon className="size-4" />
                      </span>
                    )}
                    <div>
                      <Link
                        href={`/books/${book._id}`}
                        className="font-semibold text-ink hover:text-brand"
                      >
                        {book.title}
                      </Link>
                      <p className="text-xs text-ink-muted">by {book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                    {book.category || "General"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {book.userName || user?.name}
                  <br />
                  {book.userEmail || user?.email}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBook(book)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand/40 hover:text-brand"
                    >
                      <Edit3Icon className="size-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingBook(book)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2Icon className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-lg font-bold text-ink">Edit Book Details</h2>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                aria-label="Close edit form"
                className="rounded-full p-1.5 text-ink-muted hover:bg-brand-soft"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Title
                </label>
                <input
                  name="title"
                  defaultValue={editingBook.title}
                  required
                  className={replaceInputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink">
                    Author
                  </label>
                  <input
                    name="author"
                    defaultValue={editingBook.author}
                    required
                    className={replaceInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingBook.category}
                    required
                    className={replaceInputClass}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Book Image (URL)
                </label>
                <input
                  name="image"
                  type="url"
                  defaultValue={editingBook.image || ""}
                  className={replaceInputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingBook.description}
                  required
                  className={replaceInputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-brand-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircleIcon className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">Delete Book?</h3>
            <p className="mb-6 mt-1 text-xs text-ink-muted">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-ink">
                “{deletingBook.title}”
              </span>
              ? This action cannot be undone and will delete it from the
              database.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingBook(null)}
                className="flex-1 rounded-full border border-line bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDelete}
                onClick={handleDeleteConfirm}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {submittingDelete ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
