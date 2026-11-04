import type { Metadata } from "next";
import { UserRoundIcon } from "lucide-react";

import { EmptyState, PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = {
  title: "My Profile",
};

export default function ProfilePage() {
  return (
    <RequireAuth>
      <PageShell
        eyebrow="Account"
        title="My Profile"
        description="Manage your details and see how you show up around the nook."
      >
        <EmptyState
          icon={<UserRoundIcon className="size-5" />}
          title="Profile settings coming soon"
          description="Your account details and reading preferences will be editable here."
        />
      </PageShell>
    </RequireAuth>
  );
}
