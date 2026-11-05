/**
 * Server-side proxy helper for the BookNook Express API.
 *
 * The browser only ever talks to this app's own /api routes. Requests are
 * forwarded to the Express API here, and the JWT expected by the Express
 * `verifyToken` middleware is minted server-side from the BetterAuth session
 * cookie (`auth.api.getToken`), so Bearer tokens are never exposed to the
 * browser.
 */
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function proxyToExpress(
  request: NextRequest,
  path: string
): Promise<NextResponse> {
  try {
    const headers: Record<string, string> = {};

    // Attach a Bearer JWT when the visitor has a BetterAuth session. Without
    // a session the request is forwarded unauthenticated: Express allows
    // public endpoints (e.g. GET /books) and rejects the private ones.
    const session = await auth.api.getSession({ headers: request.headers });
    if (session) {
      const { token } = await auth.api.getToken({ headers: request.headers });
      headers.Authorization = `Bearer ${token}`;
    }

    let body: string | undefined;
    if (!["GET", "HEAD"].includes(request.method)) {
      body = await request.text();
      if (body) {
        headers["Content-Type"] =
          request.headers.get("content-type") ?? "application/json";
      }
    }

    const search = new URL(request.url).search;
    const upstream = await fetch(`${API_URL}${path}${search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("API proxy failed:", error);
    return NextResponse.json(
      { message: `Could not reach the BookNook API at ${API_URL}` },
      { status: 502 }
    );
  }
}
