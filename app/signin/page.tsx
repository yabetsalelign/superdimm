"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        const role = (session.user as { role?: string }).role ?? "user";
        window.location.replace(
          ["admin", "manager", "support"].includes(role) ? "/dashboard" : "/portal"
        );
      }
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.ok) {
      setIsLoading(false);
      setError(result?.error ?? "Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
    window.location.href = ["admin", "manager", "support"].includes(role) ? "/dashboard" : "/portal";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center justify-center gap-1.5 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-xs">S</span>
            <span className="text-2xl font-extrabold tracking-tight">SuperDimm</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Telecom Subscriber Services</p>
        </div>

        <Card className="border-border/80 shadow-md">
          <CardHeader className="space-y-2 p-6 sm:p-8 border-b border-border/60">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary w-fit">
              <span>📡 Customer Portal</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Sign in to your account</CardTitle>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Manage your telecom subscription, view billing activity, and submit technical service requests.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="name@example.com"
                  className="h-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/20"
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 font-semibold text-sm shadow-xs transition-all hover:bg-primary/90 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  "Sign in to Customer Portal"
                )}
              </Button>
            </form>

            <div className="flex flex-col gap-2 pt-2 text-center text-xs text-muted-foreground">
              <p>
                Need an account?{" "}
                <Link href="/register" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                  Register here
                </Link>
              </p>
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/60 text-[11px]">
                <Link href="/" className="hover:text-foreground transition-colors">
                  ← Return to Home
                </Link>
                <span className="text-muted-foreground/30">|</span>
                <Link href="/operations/login" className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  Staff Access
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
