"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = sessionRes.ok ? await sessionRes.json() : null;
      const role = session?.user?.role ?? "user";

      const searchParams = new URLSearchParams(window.location.search);
      const rawCallbackUrl = searchParams.get("callbackUrl");

      let destination = "/portal";

      if (role === "user") {
        // Customer accounts ALWAYS go to /portal (preventing redirection to internal CRM)
        if (rawCallbackUrl && rawCallbackUrl.startsWith("/portal") && !rawCallbackUrl.startsWith("/portal/../")) {
          destination = rawCallbackUrl;
        } else {
          destination = "/portal";
        }
      } else {
        // Staff roles: admin, manager, support
        const isSafeInternalPath =
          rawCallbackUrl &&
          rawCallbackUrl.startsWith("/") &&
          !rawCallbackUrl.startsWith("//") &&
          !rawCallbackUrl.startsWith("/signin") &&
          !rawCallbackUrl.startsWith("/register");

        destination = isSafeInternalPath ? rawCallbackUrl : "/dashboard";
      }

      window.location.href = destination;
    } catch {
      window.location.href = "/portal";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg space-y-5">
        <Link href="/" className="block text-center text-lg font-semibold tracking-tight">SuperDimm</Link>
        <Card className="shadow-sm">
          <CardHeader className="space-y-3 p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Customer Service Operations</p>
            <CardTitle className="text-2xl sm:text-3xl">Sign in to your workspace</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Manage customer cases, service requests, and support workflows.</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Need an account? <Link href="/register" className="text-primary underline">Register</Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </main>
  );
}
