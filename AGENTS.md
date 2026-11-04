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
- Catalog list, home trending, and add-book POST call Express directly. Detail is the exception: `book-detail.tsx` calls the Next proxy `/api/books/[id]`, which tries Express `GET /books/:id` then falls back to filtering `GET /books` by `_id` (the Express API may only expose the collection endpoint).
- Express endpoints currently used: `GET /books`, `POST /books`, and optionally `GET /books/:id`. No borrow/return endpoints are wired.
- `/books` and home trending need the Express API at runtime; the UI shows an error card with the API URL. `npm run build` does not need the Express API.
- `/my-books`, `/my-borrows`, and `/profile` are placeholder `EmptyState` pages; only browse, detail, and add are implemented.
- `cleanup-account.mjs` is a one-off manual Mongo cleanup script with hardcoded IDs. It is not app code and is not part of build/test flows.

## Auth

- Server: `src/lib/auth.ts` — better-auth + `@better-auth/mongo-adapter`, database `booknook-User`, collections such as `user`, `account`, `session`. Exposed by `src/app/api/auth/[...all]/route.ts` via `toNextJsHandler`.
- Client: `src/lib/auth-client.ts` — `createAuthClient` with `jwtClient()`, intentionally no `baseURL` (same-origin works in dev and prod). `AuthProvider` exposes `user`, `hydrated`, `login`, `register`, `logout`; `login`/`register` return a `string | null` error for inline display.
- `RequireAuth` is a **client-side redirect gate only**, not server-side security. Private routes are `/books/add`, `/my-books`, `/my-borrows`, `/profile`; a new private route needs both `RequireAuth` and a `NAV_ITEMS` entry in `src/components/site-header.tsx`.
- **Token gap:** `apiFetch` attaches a Bearer token from localStorage/sessionStorage keys `booknook:token`, `booknook:jwt`, `better-auth-token`, `auth_token`, but nothing in the repo writes one. `auth.ts` also does not enable the server `jwt()` plugin, and `apiFetch` does not send credentials. Login sets a session cookie scoped to the Next origin; cross-origin Express calls won't receive it. Don't assume a logged-in user is authenticated to the Express API — `add-book-form` handles 401 explicitly.
- `@better-auth/mongo-adapter` is imported directly but only declared transitively by `better-auth`. Declare it in `package.json` if you change package managers or dependency layout.

## Environment

- `.env` is gitignored and there is no example file. It needs `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`; add `NEXT_PUBLIC_API_URL` only if Express is not on port 8000.
- `.env` must be UTF-8 **without a BOM**. A BOM makes Next load variables as `undefined` (e.g. `MongoClient` throws `Cannot read properties of undefined (reading 'startsWith')`).
- Only `NEXT_PUBLIC_*` variables are available in browser code.

## UI / styling

- `src/components/ui` is shadcn's **Base UI** variant (`@base-ui/react`), not Radix. Use the `render={<Link ... />}` prop instead of `asChild`; `data-popup-open`, `data-ending-style`, etc. are Base UI state conventions.
- `components.json` uses `base-nova`, Tailwind v4, and no `tailwind.config.*`. Theme tokens are CSS variables in `src/app/globals.css` under `@theme inline`.
- Use repo tokens such as `text-ink`, `text-ink-muted`, `border-line`, `bg-brand-tint`, `bg-brand-soft`, `text-brand`, and `text-brand-dark` over raw Tailwind colors.
- Use `cn` from the **`cn` npm package** (`import { cn } from "cn"`), not `clsx`/`tailwind-merge`. Imports use the `@/` alias for `src/`.
- `shadcn` must stay 4.x. `shadcn@1.0.0` is an empty placeholder and breaks the `shadcn/tailwind.css` import in `globals.css`.

## Gotchas

- **`npm run lint` is broken:** installed `eslint-config-next@15.5.29` exports the legacy `{ extends }` config, while `eslint.config.mjs` uses Next 16 flat-config imports (`...nextVitals`). ESLint fails with `ERR_MODULE_NOT_FOUND` or `nextVitals is not iterable`. Align the package with Next by bumping `eslint-config-next` to `16.4.5`, or rewrite the config with `FlatCompat`. Until then, rely on `npm run build`.
- `npm run build` must show `Cache Components enabled`, `Partial Prefetching enabled`, `Compiled successfully`, and a route table where `/books/[id]` is partial prerender and `/api/auth/[...all]` / `/api/books/[id]` are dynamic.

## Verification

1. `npm run build` — see the expected output above.
2. With the Express API running, `/books` lists cards and each **View Details** link opens `/books/<id>`.
3. Auth smoke test (safe): `POST /api/auth/sign-in/email` with a fake email/password returns HTTP 401 `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}` — proves Next + MongoDB connectivity without writing data.
