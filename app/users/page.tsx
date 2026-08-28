import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  try {
    await requireStaff(["admin"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/operations/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Administration</p>
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Read-only directory of people authorized to support customer operations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff account audit</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                  <TableCell className="max-w-72 text-muted-foreground"><span className="block truncate" title={user.email}>{user.email}</span></TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "accent" : user.role === "manager" ? "success" : user.role === "support" ? "warning" : "muted"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
