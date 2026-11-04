"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyholeIcon, MailIcon } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login, user, hydrated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [hydrated, user, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    login(email.trim(), password);
    router.push("/");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-5 py-14 sm:px-8 lg:px-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-[0_24px_70px_-40px_rgba(47,44,61,0.35)] sm:p-9">
        <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink">
          Log in to BookNook
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-muted">
          Pick up right where you left off.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl pl-9 text-[15px] focus-visible:ring-brand/25"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-gradient-to-r from-[#9a7bf1] to-[#7a5bdf] text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(122,91,223,0.8)] transition hover:from-[#8f6fe9] hover:to-[#6d4fd4]"
          >
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to BookNook?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand transition hover:text-brand-dark"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
