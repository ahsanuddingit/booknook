import type { NextRequest } from "next/server";
import { proxyToExpress } from "@/lib/api-server";

type ProxyContext = { params: Promise<{ path: string[] }> };

/**
 * Catch-all proxy: forwards `/api/proxy/{...path}` to the Express API
 * (e.g. `/api/proxy/books` → `GET /books`, `/api/proxy/borrows` with POST →
 * `POST /borrows`). A BetterAuth JWT is attached server-side from the session
 * cookie by `proxyToExpress`, so the browser never handles Bearer tokens.
 */
async function proxyHandler(request: NextRequest, { params }: ProxyContext) {
  const { path } = await params;
  const target = `/${path.map((part) => encodeURIComponent(part)).join("/")}`;
  return proxyToExpress(request, target);
}

export {
  proxyHandler as GET,
  proxyHandler as POST,
  proxyHandler as PUT,
  proxyHandler as PATCH,
  proxyHandler as DELETE,
};
