import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LandingActions } from "@/components/landing-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SuperDimm | Telecom Customer Service & CRM Portal",
  description: "Manage your telecom service requests, report network problems, and view account billing inside the SuperDimm Customer Portal.",
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        {/* Navigation Header */}
        <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground">SuperDimm</Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Signed in as <strong>{session.user?.name ?? session.user?.email}</strong>
                </span>
                <LandingActions />
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Telecommunications Service Hub</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Connecting Customers with Operations
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            SuperDimm is a full-lifecycle support and CRM system. Report service issues, manage network subscriptions, and track cases in real-time.
          </p>
        </section>

        {/* Dynamic Navigation Choices */}
        <section className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full py-6">
          {/* Customer Side */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 hover:border-primary/40 transition duration-200">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg font-semibold mb-5">
                👤
              </span>
              <h2 className="text-2xl font-bold text-foreground">Customer Portal</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For telecom subscribers. Report broadband drops, request eSIM provisioning, verify your service plan billing, and track open issues.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild size="lg" className="w-full">
                <Link href="/portal">Access Customer Portal</Link>
              </Button>
            </div>
          </div>

          {/* CRM Internal Side */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 hover:border-primary/40 transition duration-200">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg font-semibold mb-5">
                ⚙️
              </span>
              <h2 className="text-2xl font-bold text-foreground">Operations Dashboard</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For administrative staff and technicians. Route incoming requests, update troubleshooting status, and access Customer 360 profile summaries.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href={role !== "user" ? "/dashboard" : "/signin?callbackUrl=/dashboard"}>
                  Open Operations CRM
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <span>SuperDimm Customer-Service & CRM Operations Platform</span>
          <div className="flex gap-4">
            <Link href="/portal" className="text-primary hover:underline">Portal Home</Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/dashboard" className="text-primary hover:underline">CRM Operations</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

