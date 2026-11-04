import type { Metadata } from "next";

import { BookDetail } from "@/components/book-detail";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Book Details",
};

// The route awaits runtime `params` and renders a client detail view.
// `instant = false` opts it out of instant-navigation validation while
// cacheComponents is enabled (next.config.ts).
export const instant = false;

/**
 * Dynamic book route. `params` is awaited in this Server Component so the
 * client component never reads URL hooks during prerender (required with
 * `cacheComponents`, which is enabled in next.config.ts).
 */
export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      eyebrow="On the shelf"
      title="Book Details"
      description="Everything you need to know before you borrow this story."
    >
      <BookDetail id={id} />
    </PageShell>
  );
}
