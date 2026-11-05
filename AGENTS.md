# AGENTS.md — booknook

Next.js 16.4.5 App Router (Turbopack) + React 19 + shadcn/ui (**Base UI**, `base-nova` style) + better-auth/MongoDB.
The book catalog is a **separate Express API** (default `http://localhost:8000`), not MongoDB. `README.md` is stock create-next-app boilerplate and is stale; trust this file and `package.json`.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Turbopack dev server on `localhost:3000`. Reuse an existing server; `next dev` refuses to start a second one. |
| `npm run build` | The only full verification: Turbopack + TypeScript + prerender + static generation. |
| `npm run lint` | Currently broken; see Gotchas. Do not treat its failure as a code error. |

There is no `test` script, test suite, or CI workflow.

## Next.js 16 config gotchas

`next.config.ts` enables `cacheComponents`, `partialPrefetching`, `reactCompiler`, and a custom Tailwind Turbopack CSS loader. Don't remove these flags without expecting build behavior changes.

- **Never export `export const dynamic`** from a route — the build fails with `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`.
- Dynamic routes that await `params`: add **`export const instant = false`** to the server page and pass the id to a `"use client"` component. Example: `src/app/books/[id]/page.tsx`.
- Keep `useParams`/`usePathname` out of client components on dynamic routes; they break prerender under `cacheComponents`.
- The root layout uses Next 16's generated global `LayoutProps<"/">`. Don't import it; `next dev`/`next build` supplies the type.

## Data flow

- Books come from the Express API through `src/lib/api.ts` (`API_URL`, `apiFetch`), **not** MongoDB. `NEXT_PUBLIC_API_URL` is optional; the fallback is `http://localhost:8000`, with trailing slashes stripped.
- All client `apiFetch` calls go through the same-origin **catch-all proxy** `/api/proxy/[...path]` (`src/app/api/proxy/[...path]/route.ts` → `proxyToExpress` in `src/lib/api-server.ts`), which forwards to Express (`/api/proxy/books` → `GET /books`, etc., preserving method, body, and query string). The browser never talks to Express directly and never handles Bearer tokens. Detail remains its own proxy: `book-detail.tsx` calls `/api/books/[id]`, which tries Express `GET /books/:id` then falls back to filtering `GET /books` by `_id`.
- Express endpoints currently used: `GET /books`, `POST /books`, `PATCH /books/:id`, `DELETE /books/:id`, `GET /books/:id` (via the Next proxy), `POST /borrows`, `GET /borrows`, `DELETE /borrows/:id`. The full borrow/return loop is wired end to end.
- `/books`, `/books/[id]`, and home trending need the Express API at runtime; the UI shows an error card with the API URL. `npm run build` does not need the Express API.
- Home page = `HeroSlider` + `HomeCategories` (`src/components/home-categories.tsx`, static chips for Fiction / **Science** / History / Kids / Others, each deep-linking to `/books?category=…`; Science is highlighted with a "New" badge) + `CategoryBooks` (`src/components/category-books.tsx` — reusable per-category shelf, currently "Science" then "History", each card with a "View Details" link to `/books/<id>`) + `TrendingBooks` + `BookGallery` (`src/components/book-gallery.tsx`, decorative CSS-only book-mockup showcase — no image assets).
- `/books` (all-books.tsx) reads the `?category=` query param in a mount effect (no `useSearchParams` — breaks prerender under `cacheComponents`) so home category chips filter the catalog.
- Home trending cards link to book details now: featured book gets a "View Details" solid button plus the outline "Borrow Now" (which still goes to `/books`); each `TrendingCard` has a "View Details" pill and a title link to `/books/<id>`.
- Route status: all real and private routes wrap themselves in `RequireAuth` — `/books`, `/books/[id]` (private), add-book (`/add-book`, moved from `/books/add-book`), `/my-books`, `/my-borrows` (`MyBorrowsTable` in `my-borrows-client.tsx`), `/profile` (`ProfileClient` uses `authClient.updateUser`).
- Book images upload to **imgbb** from `add-book-form.tsx` using `NEXT_PUBLIC_IMGBB_API_KEY`; if the key is missing the form degrades to manual URL paste.
- Toasts go through `src/lib/toast.ts` (imperative `showToast.success/error` store) rendered by `AppToaster` mounted in the root layout.
- `my-books` filters `GET /books` by `user.email` client-side (the Express API has no per-user filter); updates use `PATCH /books/:id` (not PUT — the server only implements PATCH).
- `cleanup-account.mjs` is a one-off manual Mongo cleanup script with hardcoded IDs. It is not app code and is not part of build/test flows.

## Auth

- Server: `src/lib/auth.ts` — better-auth + `@better-auth/mongo-adapter`, database `booknook-User`, collections such as `user`, `account`, `session`. Exposed by `src/app/api/auth/[...all]/route.ts` via `toNextJsHandler`.
- Client: `src/lib/auth-client.ts` — `createAuthClient` with `jwtClient()`, intentionally no `baseURL` (same-origin works in dev and prod). `AuthProvider` exposes `user`, `hydrated`, `login`, `register`, `logout`; `login`/`register` return a `string | null` error for inline display.
- `RequireAuth` is a **client-side redirect gate only**, not server-side security. Private routes are `/add-book`, `/books/[id]`, `/books`, `/my-books`, `/my-borrows`, `/profile`; each wraps it itself, and a new private route also needs a `NAV_ITEMS` entry in `src/components/site-header.tsx` (only for top-navigable routes — detail pages don't need one).
- **Token flow (wired):** all `apiFetch` traffic goes through the same-origin `/api/proxy/[...path]` proxy (`src/lib/api-server.ts`). There the server reads the session cookie via `auth.api.getSession` and, when signed in, mints a short-lived JWT with `auth.api.getToken` (better-auth `jwt()` plugin) and attaches it as `Bearer` before forwarding to Express, whose `verifyToken` (jose, remote JWKS at `CLIENT_URL`) verifies it. The JWT is never exposed to the browser; `apiFetch` no longer sends an Authorization header. Requests without a session are forwarded unauthenticated, so public endpoints (e.g. home trending `GET /books`) still work for logged-out visitors while private ones get Express's 401. `getJwtToken`/`getAuthToken` remain in `src/lib/api.ts` as legacy helpers only. `src/lib/auth.ts` enables the `jwt()` server plugin so `/api/auth/jwks` exists.
- `@better-auth/mongo-adapter` is imported directly but only declared transitively by `better-auth`. Declare it in `package.json` if you change package managers or dependency layout.

## Environment

- `.env` is gitignored and there is no example file. It needs `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_IMGBB_API_KEY` (imgbb upload key, currently a placeholder); add `NEXT_PUBLIC_API_URL` only if Express is not on port 8000. The Express server's sibling `.env` (`booknook-server/.env`) needs `MONGODB_URI` and `CLIENT_URL` (the Next origin used for JWKS verification).
- `.env` must be UTF-8 **without a BOM**. A BOM makes Next load variables as `undefined` (e.g. `MongoClient` throws `Cannot read properties of undefined (reading 'startsWith')`).
- Only `NEXT_PUBLIC_*` variables are available in browser code.

## UI / styling

- `src/components/ui` is shadcn's **Base UI** variant (`@base-ui/react`), not Radix. Use the `render={<Link ... />}` prop instead of `asChild`; `data-popup-open`, `data-ending-style`, etc. are Base UI state conventions.
- `components.json` uses `base-nova`, Tailwind v4, and no `tailwind.config.*`. Theme tokens are CSS variables in `src/app/globals.css` under `@theme inline`.
- Use repo tokens such as `text-ink`, `text-ink-muted`, `border-line`, `bg-brand-tint`, `bg-brand-soft`, `text-brand`, and `text-brand-dark` over raw Tailwind colors.
- Use `cn` from the **`cn` npm package** (`import { cn } from "cn"`), not `clsx`/`tailwind-merge`. Imports use the `@/` alias for `src/`.
- `shadcn` must stay 4.x. `shadcn@1.0.0` is an empty placeholder and breaks the `shadcn/tailwind.css` import in `globals.css`.

## Gotchas

- **Build fixed (2026-11-05):** the two pre-existing WIP failures are resolved — `src/app/register/page.tsx` had a truncated `shadow-[...]` string (now completed), and `src/app/my-books/page.tsx` imports `MyBooksClient` from `@/components/my-books-client` wrapped in `RequireAuth`. Treat any new `npm run build` errors as fresh regressions.
- **`npm run lint` is broken:** installed `eslint-config-next@15.5.29` exports the legacy `{ extends }` config, while `eslint.config.mjs` uses Next 16 flat-config imports (`...nextVitals`). ESLint fails with `ERR_MODULE_NOT_FOUND` or `nextVitals is not iterable`. Align the package with Next by bumping `eslint-config-next` to `16.4.5`, or rewrite the config with `FlatCompat`. Until then, rely on `npm run build`.
- `npm run build` must show `Cache Components enabled`, `Partial Prefetching enabled`, `Compiled successfully`, and a route table where `/books/[id]` is partial prerender and `/api/auth/[...all]` / `/api/books/[id]` are dynamic.

## Verification

1. `npm run build` — see the expected output above.
2. With the Express API running, `/books` lists cards and each **View Details** link opens `/books/<id>`.
3. Auth smoke test (safe): `POST /api/auth/sign-in/email` with a fake email/password returns HTTP 401 `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}` — proves Next + MongoDB connectivity without writing data.
