import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LandingActions } from "@/components/landing-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SuperDimm | Telecom Customer Service & Support Portal",
  description: "Manage your telecom service requests, report network problems, and view account billing inside the SuperDimm Customer Portal.",
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        {/* Navigation Header */}
        <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
            <span className="text-xl font-bold tracking-tight text-foreground">SuperDimm</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Signed in as <strong>{session.user?.name ?? session.user?.email}</strong>
                </span>
                <Button asChild size="sm">
                  <Link href="/portal">Open Portal</Link>
                </Button>
                <LandingActions />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Customer-First Hero Section */}
        <section className="py-14 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <span>📡 Telecom Subscriber Services</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.15]">
            SuperDimm Customer Portal
          </h1>

          <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Manage your enterprise broadband, report service drops, request eSIM provisioning, and track ongoing support cases with our technical engineering team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 font-semibold shadow-md">
              <Link href="/portal">Access Customer Portal</Link>
            </Button>
            {!session ? (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/register">Create an account</Link>
              </Button>
            ) : null}
          </div>
        </section>

        {/* Customer Feature Cards */}
        <section className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto w-full py-6">
          <Card className="border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition">
            <CardHeader className="pb-2">
              <span className="text-2xl mb-2 block">⚡</span>
              <CardTitle className="text-base font-semibold">Report Problems Fast</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Log network outages, latency spikes, or SIM provisioning requests directly to our technical queue.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition">
            <CardHeader className="pb-2">
              <span className="text-2xl mb-2 block">📊</span>
              <CardTitle className="text-base font-semibold">Live Case Stepper</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Track every stage of your support ticket from initial intake to technician resolution in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition">
            <CardHeader className="pb-2">
              <span className="text-2xl mb-2 block">💳</span>
              <CardTitle className="text-base font-semibold">Billing & Statements</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                View verified service charges, SLA credits, and paid invoices in a customer-safe account summary.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Customer-Facing Footer with Subtle Staff Access */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} SuperDimm Telecommunications Services</span>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="hover:text-foreground transition">Customer Portal</Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/operations/login" className="text-muted-foreground/50 hover:text-muted-foreground text-[11px] transition">
              Staff Access
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
