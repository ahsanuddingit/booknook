import type { Metadata } from "next";
import { MyBooksClient } from "@/components/my-books-client";
import { PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = { title: "My Books" };

export default function MyBooksPage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Contributions"
        title="My Books"
        description="Manage, update, or remove the books you have added to the community catalog."
      >
        <MyBooksClient />
      </PageShell>
    </RequireAuth>
  );
}
