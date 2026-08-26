import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Operations</p>
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Application preferences are still being finalized for this demo.</p>
          <p>Planned settings include notification preferences, default statuses, and user-facing defaults.</p>
        </CardContent>
      </Card>
    </div>
  );
}
