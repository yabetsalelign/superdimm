import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isStaffRole } from "@/lib/rbac";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PortalReportForm } from "@/components/portal-report-form";

export const dynamic = "force-dynamic";

export default async function PortalReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }
  if (isStaffRole((session.user as { role?: string }).role)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="link"
                className="h-auto p-0 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                <Link href="/portal">← Back to Portal</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                S
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                SuperDimm Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      <PortalReportForm />
    </main>
  );
}
