import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestForm } from "@/components/request-form";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Service Requests</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this section.</p>
      </div>
    );
  }

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      assignedUser: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Operations</p>
          <h1 className="text-3xl font-semibold">Service Requests</h1>
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Request backlog</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No service requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.customer.name}</TableCell>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell className="capitalize">{request.status}</TableCell>
                      <TableCell className="capitalize">{request.priority}</TableCell>
                      <TableCell>{request.assignedUser?.name ?? "Unassigned"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create request</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
