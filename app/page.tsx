import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LandingActions } from "@/components/landing-actions";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const destination = role === "user" ? "/portal" : "/dashboard";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">SuperDimm</Link>
          <div className="flex items-center gap-2">
            {session ? <LandingActions /> : <Button asChild variant="outline" size="sm"><Link href="/signin">Sign in</Link></Button>}
          </div>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">Telecommunications CRM</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">Customer Service Operations</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Manage customer complaints, service requests, and support workflows in one place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href={session ? destination : "/signin"}>{session ? (role === "user" ? "Open customer portal" : "Open operations dashboard") : "Sign in"}</Link></Button>
              {!session ? <Button asChild variant="outline" size="lg"><Link href="/register">Create account</Link></Button> : null}
            </div>
            {session ? <p className="mt-4 text-sm text-muted-foreground">Signed in as {session.user?.name ?? session.user?.email}. Your workspace is ready.</p> : null}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">The support workflow</p>
            <div className="mt-6 space-y-5">
              {["Customer reports a service problem", "SuperDimm creates a case", "An agent assigns and works the issue", "The customer sees the updated status"].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                  <p className="pt-1 text-sm font-medium">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">From a disconnected internet connection to a resolved case, SuperDimm keeps the customer story and support work connected.</p>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground"><span>SuperDimm customer-service CRM</span><Link href="/portal" className="text-primary hover:underline">Customer portal prototype</Link></footer>
      </div>
    </main>
  );
}
