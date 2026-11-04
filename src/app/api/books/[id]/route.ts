import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type BookRecord = { _id: string };

async function fetchJson(path: string, authorization: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authorization ? { Authorization: authorization } : undefined,
    cache: "no-store",
  });
  return res;
}

/**
 * Proxies a single book. Tries the Express `GET /books/:id` endpoint first;
 * if the API does not implement it, falls back to `GET /books` and filters
 * by `_id` (the only endpoint the app otherwise relies on).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authorization = request.headers.get("authorization") ?? "";

  const byId = await fetchJson(`/books/${id}`, authorization);
  if (byId.ok) {
    return NextResponse.json(await byId.json());
  }

  const all = await fetchJson("/books", authorization);
  if (!all.ok) {
    return NextResponse.json(
      { message: "Could not load books" },
      { status: all.status }
    );
  }

  const books = (await all.json()) as BookRecord[];
  const book = Array.isArray(books)
    ? books.find((entry) => String(entry._id) === id)
    : undefined;

  if (!book) {
    return NextResponse.json({ message: "Book not found" }, { status: 404 });
  }

  return NextResponse.json(book);
}
