import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Platform Context</p>
        <h1 className="text-3xl font-semibold">About SuperDimm</h1>
        <p className="mt-1 text-sm text-muted-foreground">SuperDimm is a unified telecommunications support CRM and customer portal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
            <li>File support cases and report network/service outages dynamically.</li>
            <li>Maintain data persistence utilizing SQLite and Prisma ORM.</li>
            <li>Coordinate operational task assignment and triage for support agents.</li>
            <li>Enable secure, isolated self-service customer portal routing.</li>
            <li>Built with Next.js App Router and NextAuth security contexts.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}