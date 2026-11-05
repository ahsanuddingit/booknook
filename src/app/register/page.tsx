"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyholeIcon, MailIcon, UserRoundIcon, ImageIcon } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { register, user, hydrated } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [hydrated, user, router]);

  // Password validation helper based on requirements
  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter.";
    }
    return null;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || pending) return;
    setErrorMessage(null);

    // Run password validation criteria check
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setPending(true);
    
    // Note: passing photoURL or handling extra fields if supported by auth provider
    const failure = await register(name.trim(), email.trim(), password);
    
    if (failure) {
      setErrorMessage(failure);
      setPending(false);
      return;
    }
    
    // Successfully registered -> navigate to Login page (or Home per auth flow)
    router.replace("/login");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-5 py-14 sm:px-8 lg:px-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-[0_24px_70px_-40px_rgba(47,44,61,0.35)] sm:p-9">
        <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
          Join the nook
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-muted">
          Lend, borrow, and keep every story in one place.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-semibold text-ink">
              Full name
            </Label>
            <div className="relative">
              <UserRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="name"
                required
                autoComplete="name"
                placeholder="Ahsan Rahman"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-xl pl-9 text-[15px] focus-visible:ring-brand/25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-semibold text-ink">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl pl-9 text-[15px] focus-visible:ring-brand/25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoURL" className="text-[13px] font-semibold text-ink">
              Photo URL <span className="text-ink-muted font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="photoURL"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoURL}
                onChange={(event) => setPhotoURL(event.target.value)}
                className="h-11 rounded-xl pl-9 text-[15px] focus-visible:ring-brand/25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[13px] font-semibold text-ink"
            >
              Password
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl pl-9 text-[15px] focus-visible:ring-brand/25"
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              Must be at least 6 characters long and include an uppercase and lowercase letter.
            </p>
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive"
            >
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-full bg-gradient-to-r from-[#9a7bf1] to-[#7a5bdf] text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(122,91,223,0.45)]"
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-[13px] text-ink-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}