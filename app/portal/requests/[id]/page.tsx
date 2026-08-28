import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCustomerOwnership } from "@/lib/rbac";
import { isStaffRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCaseReference,
  formatCategoryLabel,
  formatCaseLabel,
} from "@/lib/case-utils";
import { LandingActions } from "@/components/landing-actions";

export const dynamic = "force-dynamic";

function getStatusBadgeVariant(status: string) {
  if (status === "closed" || status === "resolved") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

function getStepStatus(currentStatus: string, stepIndex: number) {
  // stepIndex: 1 = Submitted, 2 = In Progress, 3 = Resolved
  if (stepIndex === 1) return "completed";

  if (stepIndex === 2) {
    if (["resolved", "closed"].includes(currentStatus)) {
      return "completed";
    }
    if (["assigned", "in_progress", "escalated", "pending_customer"].includes(currentStatus)) {
      return "active";
    }
    return "pending";
  }

  if (stepIndex === 3) {
    if (["resolved", "closed"].includes(currentStatus)) {
      return "completed";
    }
    return "pending";
  }
  return "pending";
}

function getStatusExplanation(status: string) {
  const explanations: Record<string, string> = {
    open: "We have received your service request. It is currently in our operations queue and will be reviewed by an agent shortly.",
    assigned: "Your request has been assigned to a technical support representative and is queued for verification.",
    in_progress: "An operations technician is actively working on your service request. We will update this page as progress is made.",
    escalated: "Your issue requires senior engineering resources. It has been escalated for advanced troubleshooting.",
    pending_customer: "Our support representatives need further details or action on your end. Please contact support referencing this ticket.",
    resolved: "This issue has been marked as resolved by our technical support team. Please verify that your service is working correctly.",
    closed: "This service request has been officially closed. If you experience further issues, please file a new report.",
  };
  return explanations[status] ?? "Your request is currently being processed.";
}

export default async function CustomerCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }
  if (isStaffRole((session.user as { role?: string }).role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!request) {
    notFound();
  }

  // Enforce customer ownership check
  const isOwner = await verifyCustomerOwnership(request.customerId, session);
  if (!isOwner) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center space-y-4">
        <Card className="border-destructive/30 bg-destructive/5 p-6">
          <CardHeader>
            <CardTitle className="text-destructive text-2xl font-bold">Access Restricted</CardTitle>
            <CardDescription className="text-sm">
              You do not have administrative permission or ownership credentials to view this telecom request.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild>
              <Link href="/portal">← Return to Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const reference = getCaseReference(request.id);
  const status = request.status;
  
  // Stepper statuses
  const step1 = getStepStatus(status, 1);
  const step2 = getStepStatus(status, 2);
  const step3 = getStepStatus(status, 3);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Customer Portal Standalone Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
          <Link href="/portal" className="text-xl font-bold tracking-tight text-foreground">SuperDimm Portal</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Logged in as <strong>{session.user?.email}</strong>
          </span>
          <LandingActions />
        </div>
      </header>

      {/* Header Back Button & Case Reference */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="link" className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <Link href="/portal">← Return to Portal</Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-xs font-bold text-primary">{reference}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {request.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Reported on {new Date(request.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
          <Badge variant={getStatusBadgeVariant(status)}>
            {formatCaseLabel(status)}
          </Badge>
          <Badge variant="default">
            {formatCategoryLabel(request.category)}
          </Badge>
        </div>
      </div>

      {/* Progress Stepper Visual Layout */}
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Request Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto py-4">
            {/* Connecting Progress Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-muted -z-10" />
            <div 
              className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300 -z-10`}
              style={{
                width: step3 === "completed" ? "100%" : step2 === "completed" || step2 === "active" ? "50%" : "0%"
              }}
            />

            {/* Step 1: Submitted */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                ✓
              </div>
              <span className="text-xs font-semibold text-foreground">Submitted</span>
            </div>

            {/* Step 2: In Progress */}
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition duration-200 ${
                step2 === "completed" 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : step2 === "active" 
                    ? "bg-background border-primary text-primary animate-pulse" 
                    : "bg-background border-muted text-muted-foreground"
              }`}>
                {step2 === "completed" ? "✓" : "2"}
              </div>
              <span className={`text-xs font-semibold ${step2 !== "pending" ? "text-foreground" : "text-muted-foreground"}`}>
                In Progress
              </span>
            </div>

            {/* Step 3: Resolved */}
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition duration-200 ${
                step3 === "completed" 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : "bg-background border-muted text-muted-foreground"
              }`}>
                {step3 === "completed" ? "✓" : "3"}
              </div>
              <span className={`text-xs font-semibold ${step3 === "completed" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                Resolved
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="mt-6 border-t border-border/60 pt-4 text-center max-w-xl mx-auto">
            <p className="text-sm text-foreground leading-relaxed">
              {getStatusExplanation(status)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Case Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Ticket Details */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-semibold">Reported Issue Details</CardTitle>
            <CardDescription className="text-xs">Your verbatim submission details</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 min-h-[120px]">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {request.description || "No additional detailed description was provided with this ticket."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Metadata */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-semibold">Case Information</CardTitle>
            <CardDescription className="text-xs">General ticket metadata</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Reference Code</span>
              <span className="font-mono text-sm text-foreground font-bold">{reference}</span>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Service Category</span>
              <span className="font-medium text-foreground text-sm">{formatCategoryLabel(request.category)}</span>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Date Submitted</span>
              <span className="font-medium text-foreground">
                {new Date(request.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Last Updated</span>
              <span className="font-medium text-foreground">
                {new Date(request.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-2">
              <p className="text-muted-foreground leading-normal">
                This ticket is currently assigned to our <strong>Technical Operations Queue</strong>. Case updates are refreshed in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portal Back Button Footer */}
      <div className="flex justify-center pt-4">
        <Button asChild variant="outline">
          <Link href="/portal">← Return to Portal Home</Link>
        </Button>
      </div>
    </main>
  );
}
