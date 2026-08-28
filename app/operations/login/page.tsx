"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OperationsLoginPage() {
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
      setError(result?.error ?? "Invalid staff credentials.");
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = sessionRes.ok ? await sessionRes.json() : null;
      const role = session?.user?.role ?? "user";

      // If a customer account accidentally logs in here, send them directly to the customer portal
      if (role === "user") {
        window.location.href = "/portal";
        return;
      }

      // Staff roles: admin, manager, support
      const searchParams = new URLSearchParams(window.location.search);
      const rawCallbackUrl = searchParams.get("callbackUrl");

      const isSafeInternalPath =
        rawCallbackUrl &&
        rawCallbackUrl.startsWith("/") &&
        !rawCallbackUrl.startsWith("//") &&
        !rawCallbackUrl.startsWith("/signin") &&
        !rawCallbackUrl.startsWith("/register") &&
        !rawCallbackUrl.startsWith("/operations/login");

      const destination = isSafeInternalPath ? rawCallbackUrl : "/dashboard";
      window.location.href = destination;
    } catch {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900/95 px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg space-y-5">
        <div className="flex items-center justify-center gap-2">
          <span className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
          <span className="text-xl font-bold tracking-tight text-white">SuperDimm Operations</span>
        </div>
        <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <CardHeader className="space-y-2 p-6 sm:p-8 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Restricted Internal System</p>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-white">Staff Authentication</CardTitle>
            <p className="text-xs leading-relaxed text-slate-400">
              Sign in with your authorized support, engineering, or administrator credentials to access the internal CRM.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="staff-email" className="text-slate-300 text-xs font-semibold">Staff Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@superdimm.local"
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400 focus-visible:border-primary"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-password" className="text-slate-300 text-xs font-semibold">Password</Label>
                <PasswordInput
                  id="staff-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400 focus-visible:border-primary [&+button]:text-slate-300 [&+button]:hover:text-white"
                  required
                />
              </div>
              {error ? <p className="text-xs text-destructive font-medium">{error}</p> : null}
              <Button type="submit" disabled={isLoading} className="w-full font-medium">
                {isLoading ? "Authenticating..." : "Sign in to Operations"}
              </Button>
            </form>
            <div className="border-t border-slate-800/80 pt-4 text-center">
              <Link href="/" className="inline-flex rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                ← Return to Customer Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
