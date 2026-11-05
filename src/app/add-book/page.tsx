import type { Metadata } from "next";
import { AddBookForm } from "@/components/add-book-form";
import { PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = { title: "Add Book" };

export default function AddBookPage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Share a story"
        title="Add Book"
        description="Give one of your books a new shelf life. Add the details and let another reader borrow it."
      >
        <AddBookForm />
      </PageShell>
    </RequireAuth>
  );
}
