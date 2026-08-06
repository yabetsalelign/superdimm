import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">👤 Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><strong>Name:</strong> Demo User</p>
          <p><strong>Email:</strong> demo@superdimm.com</p>
          <p><strong>Role:</strong> User</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Stack</CardTitle>
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