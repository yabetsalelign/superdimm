import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { requireStaff } from "@/lib/rbac";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/operations/login");
  }

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { name?: string; email?: string; role?: string } | undefined;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">User settings</p>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your credentials, preferences, and notification status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
                <span className="font-medium text-muted-foreground">Name</span>
                <span className="font-semibold text-foreground">{sessionUser?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
                <span className="font-medium text-muted-foreground">Email Address</span>
                <span className="font-semibold text-foreground">{sessionUser?.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-1">
                <span className="font-medium text-muted-foreground">Operational Role</span>
                <span className="font-semibold text-foreground capitalize">{sessionUser?.role || "user"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
              <span>Email Notifications</span>
              <span className="text-muted-foreground font-medium">Enabled</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
              <span>Two-Factor Auth</span>
              <span className="text-muted-foreground font-medium">Disabled</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-1">
              <span>Theme Preference</span>
              <span className="text-muted-foreground font-medium">System</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
