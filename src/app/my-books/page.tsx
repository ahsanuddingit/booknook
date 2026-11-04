import type { Metadata } from "next";
import { BookmarkIcon } from "lucide-react";

import { EmptyState, PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = {
  title: "My Books",
};

export default function MyBooksPage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Your shelf"
        title="My Books"
        description="The books you have shared with the nook, all in one place."
      >
        <EmptyState
          icon={<BookmarkIcon className="size-5" />}
          title="No books on your shelf yet"
          description="Books you add to BookNook will be listed here."
        />
      </PageShell>
    </RequireAuth>
  );
}
