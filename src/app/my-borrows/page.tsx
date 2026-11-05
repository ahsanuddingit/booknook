import type { Metadata } from "next";
import { MyBorrowsTable } from "@/components/my-borrows-client";
import { PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = { title: "My Borrows" };

export default function MyBorrowsPage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Borrowed stories"
        title="My Borrows"
        description="Keep track of the books you have borrowed and when they are due back."
      >
        <MyBorrowsTable />
      </PageShell>
    </RequireAuth>
  );
}
