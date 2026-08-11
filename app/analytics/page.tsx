import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Operations</p>
        <h1 className="text-3xl font-semibold">Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Operational analytics will be added here in the next milestone.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Request volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Placeholder for service-request monitoring.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Placeholder for customer health metrics.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
