"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error || "Unable to create account.");
      return;
    }

    router.push("/signin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg space-y-5">
        <Link href="/" className="flex items-center justify-center gap-2 text-center text-xl font-bold tracking-tight text-foreground"><span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">S</span>SuperDimm</Link>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="space-y-3 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Subscriber Access</p>
            <CardTitle className="text-2xl sm:text-3xl">Create an account</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Register to access subscriber tools, report issues, and manage plans.</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
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
                  placeholder="••••••••"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link href="/signin" className="font-medium text-primary underline underline-offset-4">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
