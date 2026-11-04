"use client";

import { useState } from "react";
import { UserRoundIcon, MailIcon, CalendarIcon, ShieldCheckIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { RequireAuth } from "@/components/require-auth";
import { authClient } from "@/lib/auth-client";
import { cn } from "cn";

export function ProfileClient() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync local name state if user data loads/updates later
  if (user && name === "" && user.name && !isEditing) {
    setName(user.name);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await authClient.updateUser({
        name: name.trim(),
      });

      if (updateError) {
        setError(updateError.message ?? "Failed to update profile details.");
      } else {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        await refetch();
      }
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <RequireAuth>
        <PageShell
          eyebrow="Account"
          title="My Profile"
          description="Manage your details and see how you show up around the nook."
        >
          <div className="flex items-center justify-center py-16 text-ink-muted">
            <Loader2Icon className="size-6 animate-spin" />
          </div>
        </PageShell>
      </RequireAuth>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <RequireAuth>
      <PageShell
        eyebrow="Account"
        title="My Profile"
        description="Manage your details and see how you show up around the nook."
      >
        <div className="grid gap-6 max-w-2xl">
          {/* Profile Card Header */}
          <div className="rounded-xl border border-line bg-card p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="size-20 rounded-full bg-brand-tint text-brand flex items-center justify-center font-semibold text-2xl border border-brand/20 shrink-0">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "Profile avatar"}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <UserRoundIcon className="size-10" />
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-ink truncate">
                  {user?.name || "Booknook Reader"}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-tint text-brand border border-brand/20">
                  <ShieldCheckIcon className="size-3.5" />
                  Verified Member
                </span>
              </div>
              <p className="text-sm text-ink-muted truncate">{user?.email}</p>
              <p className="text-xs text-ink-muted flex items-center gap-1.5 pt-1">
                <CalendarIcon className="size-3.5" />
                Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Account Details Form Card */}
          <div className="rounded-xl border border-line bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-base font-semibold text-ink">Personal Information</h3>
                <p className="text-xs text-ink-muted">Update your display name and view account details.</p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-line bg-surface hover:bg-brand-tint hover:text-brand transition-colors text-ink cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3.5 py-2.5 rounded-lg">
                <CheckCircle2Icon className="size-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3.5 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || isSaving}
                  placeholder="Your name"
                  className={cn(
                    "w-full rounded-lg border px-3.5 py-2 text-sm text-ink transition-all outline-none",
                    isEditing
                      ? "border-brand bg-surface focus:ring-2 focus:ring-brand/20"
                      : "border-line bg-surface/50 cursor-not-allowed opacity-80"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <MailIcon className="size-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink-muted bg-surface/50 cursor-not-allowed opacity-80"
                />
                <p className="text-[11px] text-ink-muted">
                  Email address cannot be changed directly from here.
                </p>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name ?? "");
                      setError(null);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-medium text-ink hover:bg-surface border border-line rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Reading Preferences Section Placeholder */}
          <div className="rounded-xl border border-line bg-card p-6 shadow-xs space-y-3">
            <h3 className="text-base font-semibold text-ink">Reading Preferences</h3>
            <p className="text-xs text-ink-muted">
              Customize your literary genres, reading goals, and favorite nook recommendations.
            </p>
            <div className="p-4 rounded-lg border border-dashed border-line bg-surface/50 text-center text-xs text-ink-muted">
              More preference toggles will appear here soon.
            </div>
          </div>
        </div>
      </PageShell>
    </RequireAuth>
  );
}