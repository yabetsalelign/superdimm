import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerRequestPrototype } from "@/components/customer-request-prototype";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCustomerForSession } from "@/lib/rbac";
import { getCaseReference, formatCaseLabel } from "@/lib/case-utils";
import { LandingActions } from "@/components/landing-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "closed" || status === "resolved") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

function getTransactionSafeType(type: string) {
  const map: Record<string, string> = {
    subscription: "Service Charge",
    payment: "Payment Received",
    hardware: "Hardware Purchase",
    adjustment: "Account Credit",
  };
  return map[type.toLowerCase()] ?? "Account Charge";
}

function getTransactionSafeStatus(type: string) {
  const map: Record<string, string> = {
    payment: "Completed",
    subscription: "Charged",
    hardware: "Charged",
    adjustment: "Applied",
  };
  return map[type.toLowerCase()] ?? "Processed";
}

function getTransactionStatusVariant(type: string) {
  if (type === "payment" || type === "adjustment") return "success" as const;
  return "default" as const;
}

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }

  const customer = await getCustomerForSession(session);
  if (!customer) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-foreground">No Profile Found</h1>
        <p className="text-muted-foreground">We were unable to locate or create a customer profile linked to your user account.</p>
        <div className="pt-4">
          <Link href="/" className="text-primary underline text-sm">Return Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Customer Portal Standalone Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
          <Link href="/portal" className="text-xl font-bold tracking-tight text-foreground">SuperDimm Portal</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden max-w-80 truncate text-xs text-muted-foreground sm:inline" title={`${session.user?.email ?? ""} (ID: ${customer.id})`}>
            Logged in as <strong>{session.user?.email}</strong> (ID: <span className="font-mono text-primary font-semibold">{customer.id}</span>)
          </span>
          <LandingActions />
        </div>
      </header>

      {/* Welcome Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {customer.name}</h1>
        <p className="text-sm text-muted-foreground">Manage your telecom subscription, report network outages, and track troubleshooting requests.</p>
      </div>

      {/* Primary Action Row */}
      <section className="flex justify-between items-center bg-muted/20 border border-border/60 rounded-xl p-4 sm:p-5" aria-label="Quick Actions">
        <div className="space-y-1 pr-4">
          <h3 className="font-semibold text-sm sm:text-base">Experiencing network drops or billing discrepancies?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Create an official ticket. Our engineering queue will pick it up automatically.</p>
        </div>
        <div className="shrink-0">
          <CustomerRequestPrototype />
        </div>
      </section>

      {/* Account Overview Cards */}
      <section aria-labelledby="account-summary-heading" className="space-y-4">
        <div>
          <h2 id="account-summary-heading" className="text-xl font-semibold">Account Summary</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Account Status</CardDescription><CardTitle className="text-xl capitalize">{customer.status}</CardTitle></CardHeader>
            <CardContent><Badge variant={customer.status === "active" ? "success" : "warning"}>{customer.status === "active" ? "Active / In Good Standing" : "Pending Activation"}</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Active Service Plan</CardDescription><CardTitle className="text-xl truncate" title={customer.plan ?? ""}>{customer.plan || "Standard Plan"}</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">100% Service Level Agreement (SLA)</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="min-w-0 pb-2"><CardDescription className="text-xs">Account ID Reference</CardDescription><CardTitle className="truncate font-mono text-xl text-primary" title={customer.id}>{customer.id}</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">Quote this in communications</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="min-w-0 pb-2"><CardDescription className="text-xs">Primary Contact Email</CardDescription><CardTitle className="truncate text-lg" title={customer.email ?? undefined}>{customer.email || "No email registered"}</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">Notifications target this address</p></CardContent>
          </Card>
        </div>
      </section>

      {/* Support Cases and Safe Transactions */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Support Request list */}
        <Card>
          <CardHeader>
            <CardTitle>My Support Requests</CardTitle>
            <CardDescription>Track the troubleshooting timeline and status updates of your submitted cases.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {customer.serviceRequests.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  You have not submitted any support requests yet.
                </div>
              ) : (
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Issue</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Date Submitted</th>
                      <th className="pb-3 font-medium text-right">Case Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customer.serviceRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/10 transition">
                        <td className="py-4 pr-4 font-medium">
                          <Link href={`/portal/requests/${request.id}`} className="hover:underline text-foreground hover:text-primary transition">
                            {request.title}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={statusVariant(request.status)}>
                            {formatCaseLabel(request.status)}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap py-4 pr-4 text-muted-foreground text-xs">
                          {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </td>
                        <td className="whitespace-nowrap py-4 text-muted-foreground font-mono text-xs text-right">
                          <Link href={`/portal/requests/${request.id}`} className="hover:underline hover:text-primary font-bold">
                            {getCaseReference(request.id)}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safe Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Billing & Activity</CardTitle>
            <CardDescription>Customer-safe overview of billing statements and paid transactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {customer.transactions.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No recent account activity recorded.
              </div>
            ) : (
              customer.transactions.map((txn) => {
                return (
                  <div key={txn.id} className="flex items-center justify-between gap-4 border-b border-border/60 py-4 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm text-foreground">{txn.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })} · {getTransactionSafeType(txn.type)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right space-y-1.5">
                      <p className="font-semibold text-sm text-foreground">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.amount)}
                      </p>
                      <Badge variant={getTransactionStatusVariant(txn.type)}>
                        {getTransactionSafeStatus(txn.type)}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need direct assistance? You can reach customer service at +1 555-SUPER-DIMM.
      </p>
    </main>
  );
}
