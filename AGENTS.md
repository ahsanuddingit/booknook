# AGENTS.md — booknook

**Next.js 16.4.5 (Turbopack)** + **React 19** + **shadcn/ui** + **better-auth** + **MongoDB** app. The book catalog itself lives in a **separate Express API** (default `http://localhost:8000`), not in MongoDB.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Production build: Turbopack, TypeScript, prerender, static generation |
| `npm run dev` | Turbopack dev server on `localhost:3000` |
| `npm run lint` | ESLint (no test suite exists; `next build` is the real verification) |

There is no `test` script. If an existing dev server holds port 3000, `next dev` refuses to start another; reuse it instead of killing it.

## Next.js 16 / Cache Components (easy to get wrong)

`next.config.ts` enables **`cacheComponents`** (confirm via the build banner). Consequences:

- **Never export `export const dynamic`** from a route — the build fails with `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`.
- For dynamic routes that await `params` (or use `useParams`/`usePathname` in a client component), add **`export const instant = false`** to the server page. Without it the build fails with `CLIENT_HOOK_DYNAMIC` / blocking-prerender errors. Example: `src/app/books/[id]/page.tsx`.
- Pattern used for dynamic pages: server page `await`s `params` and passes the id as a prop to a `"use client"` component. Keep URL hooks (`useParams`, `usePathname`) out of client components on dynamic routes when possible.

## Data flow

- **Books**: external Express API at `NEXT_PUBLIC_API_URL` (falls back to `http://localhost:8000`). Client helper is `src/lib/api.ts`; `apiFetch` attaches a Bearer token from localStorage keys `booknook:token`, `booknook:jwt`, `better-auth-token`, `auth_token`.
- `src/components/all-books.tsx` renders the catalog cards (cover, title, author, category, availability) with a **View Details** link to `/books/[id]`.
- Detail page: `src/app/books/[id]/page.tsx` → `src/components/book-detail.tsx`.
- `src/app/api/books/[id]/route.ts` proxies `GET /books/:id`, then falls back to `GET /books` filtered by `_id` (the Express API may only expose the collection endpoint).
- `/books` cannot load unless the Express API is running; the UI shows an error card with the API URL.

## Auth (better-auth + MongoDB)

- Server: `src/lib/auth.ts` — better-auth with `@better-auth/mongo-adapter`, database `booknook-User`, collections `user`, `account`, `session`. Exposed via `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`).
- Client: `src/components/auth-provider.tsx` wraps `authClient.useSession()`; `login`/`register` are async and return an error string (or `null`), which the login/register pages render inline. `logout` is async.
- `src/lib/auth-client.ts` intentionally omits `baseURL`; same-origin works in dev and prod. Non-`NEXT_PUBLIC_` env vars are not available in the browser bundle.
- Protected pages use `RequireAuth` (`/books/add`, `/my-books`, `/my-borrows`, `/profile`). Adding a private route also requires a `NAV_ITEMS` entry in `src/components/site-header.tsx`.

## Environment

- `.env` at repo root needs `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and (`NEXT_PUBLIC_API_URL` if the Express API is not on port 8000).
- The `.env` must be UTF-8 without a BOM; otherwise Next's env loader yields `undefined` (e.g. `MongoClient` throws `Cannot read properties of undefined (reading 'startsWith')`).

## Gotchas

- **shadcn must be 4.x.** `shadcn@1.0.0` is a placeholder package with no files, causing `Can't resolve 'shadcn/tailwind.css'` from `src/app/globals.css`. Fix: `npm install shadcn@latest` (currently 4.23.0), which ships `dist/tailwind.css`.
- Utility classes use the **`cn` npm package**, not `clsx`/`tailwind-merge`: `import { cn } from "cn"`.
- Imports use the `@/` alias for `src/` (e.g. `@/components/ui/button`).
- `npm install` prints harmless peer-dependency warnings: `eslint-config-next@15.5.29` wants ESLint 8 while the repo has ESLint 9.
- Styling uses custom tokens defined in `src/app/globals.css`: `text-ink`, `text-ink-muted`, `border-line`, `bg-brand-tint`, `bg-brand-soft`, etc. Prefer them over raw Tailwind colors.

## Verification

1. `npm run build` must end with `Compiled successfully` and list `/books/[id]` (partial prerender) plus `/api/books/[id]` and `/api/auth/[...all]` (dynamic).
2. With the Express API running, `/books` lists cards and each **View Details** link opens `/books/<id>`.
3. Auth smoke test (safe): `POST /api/auth/sign-in/email` with a fake email/password returns HTTP 401 `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}` — proves API + MongoDB connectivity without writing data.
