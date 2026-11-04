import type { Metadata } from "next";

import { AllBooks } from "@/components/all-books";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "All Books",
};

export default function AllBooksPage() {
  return (
    <PageShell
      eyebrow="The shelves"
      title="All Books"
      description="Every story shared by the BookNook community lives here. Browse the collection and find your next read."
    >
      <AllBooks />
    </PageShell>
  );
}
