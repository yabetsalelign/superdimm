import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { name?: string; email?: string; role?: string } | undefined;

  if (!sessionUser?.email) {
    return (
      <main className="max-w-3xl mx-auto p-8 space-y-4">
        <h1 className="text-4xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">👤 Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {sessionUser?.name || "—"}</p>
          <p><strong>Email:</strong> {sessionUser?.email}</p>
          <p><strong>Role:</strong> {sessionUser?.role || "user"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Email Notifications</span>
            <span className="text-muted-foreground font-medium">Enabled</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Two-Factor Auth</span>
            <span className="text-muted-foreground font-medium">Disabled</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Theme Preference</span>
            <span className="text-muted-foreground font-medium">System</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
