import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
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
