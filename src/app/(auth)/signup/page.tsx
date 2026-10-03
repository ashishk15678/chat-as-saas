"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { APP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? "Something went wrong. Try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <div className="bg-surface flex min-h-dvh flex-col">
      {/* Nav */}
      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-[-0.02em]"
        >
          <span className="bg-primary size-5 rounded-md" aria-hidden />
          {APP.name}
        </Link>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-2 sm:px-6 sm:pb-20">
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Free plan includes one chatbot and 100 messages a month.
            </p>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="press w-full gap-2.5"
            disabled={googleLoading}
            onClick={handleGoogle}
          >
            <GoogleMark />
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </Button>

          {/* Divider */}
          <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            or continue with email
            <span className="bg-border h-px flex-1" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="press h-10 w-full"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-muted-foreground mt-4 text-center text-xs leading-relaxed">
            By continuing you agree to the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z"
      />
    </svg>
  );
}
