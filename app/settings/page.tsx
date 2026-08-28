import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  try { await requireStaff(["admin", "manager", "support"]); } catch (err) { const e = err as { code?: string }; if (e?.code === "FORBIDDEN") redirect("/portal"); redirect("/operations/login"); }
  return <div className="space-y-6">
    <div className="border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Settings</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Operations Configuration</h1><p className="mt-1 text-sm text-muted-foreground">A reference for the configuration currently available in this workspace.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>System</CardTitle><CardDescription>Organization and service context for this workspace.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><div className="rounded-lg border border-border/70 bg-muted/20 p-3"><p className="font-medium">Organization</p><p className="mt-1 text-muted-foreground">SuperDimm telecommunications service workspace.</p></div><div className="rounded-lg border border-border/70 bg-muted/20 p-3"><p className="font-medium">Service configuration</p><p className="mt-1 text-muted-foreground">Subscriber plans and account status are maintained in individual customer records.</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Operations</CardTitle><CardDescription>Queue behavior is managed through the existing case workspace.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><div className="rounded-lg border border-border/70 bg-muted/20 p-3"><p className="font-medium">Case categories and priority</p><p className="mt-1 text-muted-foreground">Set when a case is logged and used in triage and analytics.</p></div><div className="rounded-lg border border-border/70 bg-muted/20 p-3"><p className="font-medium">Lifecycle and assignments</p><p className="mt-1 text-muted-foreground">Managed directly from individual customer cases.</p></div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Account</CardTitle><CardDescription>Profile and access controls remain governed by the authenticated staff account.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">No additional preference controls are exposed here, so this page does not imply settings that are not currently supported.</p></CardContent></Card>
  </div>;
}
