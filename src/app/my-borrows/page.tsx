import type { Metadata } from "next";
import { HeartIcon } from "lucide-react";

import { EmptyState, PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = {
  title: "My Borrows",
};

export default function MyBorrowsPage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Borrowed stories"
        title="My Borrows"
        description="Keep track of the books you have borrowed and when they are due back."
      >
        <EmptyState
          icon={<HeartIcon className="size-5" />}
          title="Nothing borrowed yet"
          description="When you borrow a book, it will show up here with its due date."
        />
      </PageShell>
    </RequireAuth>
  );
}
